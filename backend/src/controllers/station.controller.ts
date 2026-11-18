import { Request, Response } from 'express';
import { Station, IStation } from '../models/Station';
import { ChargingPoint } from '../models/ChargingPoint';
import { Slot } from '../models/Slot';
import { AuthRequest } from '../middleware/auth.middleware';

// 1. Get all stations (with search, city filter, and pagination)
export const getAllStations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, search, status, page = 1, limit = 20 } = req.query;

    const query: any = {};

    // By default, regular visitors and drivers only see approved stations
    if (status && typeof status === 'string') {
      query.status = status;
    } else {
      query.status = 'approved';
    }

    if (city && typeof city === 'string') {
      query.city = { $regex: new RegExp(city, 'i') };
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { address: { $regex: new RegExp(search, 'i') } },
        { city: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const stations = await Station.find(query)
      .populate('operator', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Station.countDocuments(query);

    // Attach charging point counts to each station
    const stationsWithCounts = await Promise.all(
      stations.map(async (st) => {
        const chargingPointCount = await ChargingPoint.countDocuments({
          station: st._id,
        });
        const availablePointCount = await ChargingPoint.countDocuments({
          station: st._id,
          status: 'available',
        });
        return {
          ...st.toObject(),
          totalChargers: chargingPointCount,
          availableChargers: availablePointCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      count: stationsWithCounts.length,
      data: stationsWithCounts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch stations',
    });
  }
};

// 2. Find nearby stations using GeoJSON $near / $geoNear
export const getNearbyStations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, maxDistanceKm = 30 } = req.query;

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        message: 'Latitude (lat) and longitude (lng) query parameters are required',
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const maxDistanceMeters = parseFloat(maxDistanceKm as string) * 1000;

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values',
      });
      return;
    }

    const stations = await Station.find({
      status: 'approved',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    }).populate('operator', 'name email phone');

    // Attach charger availability counts
    const stationsWithChargers = await Promise.all(
      stations.map(async (st) => {
        const chargers = await ChargingPoint.find({ station: st._id });
        return {
          ...st.toObject(),
          chargers,
          totalChargers: chargers.length,
          availableChargers: chargers.filter((c) => c.status === 'available').length,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: stationsWithChargers.length,
      data: stationsWithChargers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search nearby stations',
    });
  }
};

// 3. Get single station details with all charging points
export const getStationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const station = await Station.findById(req.params.id).populate(
      'operator',
      'name email phone'
    );

    if (!station) {
      res.status(404).json({ success: false, message: 'Station not found' });
      return;
    }

    const chargingPoints = await ChargingPoint.find({ station: station._id });

    res.status(200).json({
      success: true,
      data: {
        ...station.toObject(),
        chargingPoints,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve station details',
    });
  }
};

// 4. Create new station (Operator only)
export const createStation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      address,
      city,
      longitude,
      latitude,
      operatingHours,
      amenities,
      images,
    } = req.body;

    if (!name || !address || !city || longitude === undefined || latitude === undefined) {
      res.status(400).json({
        success: false,
        message: 'Name, address, city, longitude, and latitude are required',
      });
      return;
    }

    const station = await Station.create({
      name,
      description: description || '',
      address,
      city,
      operator: req.user!._id,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      },
      operatingHours: operatingHours || { open: '06:00', close: '23:00' },
      amenities: amenities || ['Restrooms', 'Café', 'WiFi'],
      images: images || [],
      status: req.user!.role === 'admin' ? 'approved' : 'pending',
    });

    res.status(201).json({
      success: true,
      message:
        req.user!.role === 'admin'
          ? 'Station created and approved'
          : 'Station submitted successfully and is pending administrator approval',
      data: station,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create station',
    });
  }
};

// 5. Get all stations belonging to the currently logged in operator
export const getMyStations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stations = await Station.find({ operator: req.user!._id }).sort({
      createdAt: -1,
    });

    const stationsWithStats = await Promise.all(
      stations.map(async (st) => {
        const chargingPoints = await ChargingPoint.find({ station: st._id });
        return {
          ...st.toObject(),
          totalChargers: chargingPoints.length,
          availableChargers: chargingPoints.filter((c) => c.status === 'available')
            .length,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: stationsWithStats.length,
      data: stationsWithStats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve operator stations',
    });
  }
};

// 6. Update station (Operator owner or Admin)
export const updateStation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const station = await Station.findById(req.params.id);

    if (!station) {
      res.status(404).json({ success: false, message: 'Station not found' });
      return;
    }

    // Authorization check
    if (
      req.user!.role !== 'admin' &&
      station.operator.toString() !== req.user!._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update stations that you own',
      });
      return;
    }

    const {
      name,
      description,
      address,
      city,
      longitude,
      latitude,
      operatingHours,
      amenities,
      images,
    } = req.body;

    if (name) station.name = name;
    if (description !== undefined) station.description = description;
    if (address) station.address = address;
    if (city) station.city = city;
    if (operatingHours) station.operatingHours = operatingHours;
    if (amenities) station.amenities = amenities;
    if (images) station.images = images;

    if (longitude !== undefined && latitude !== undefined) {
      station.location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    await station.save();

    res.status(200).json({
      success: true,
      message: 'Station updated successfully',
      data: station,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update station',
    });
  }
};

// 7. Delete station (Operator owner or Admin)
export const deleteStation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const station = await Station.findById(req.params.id);

    if (!station) {
      res.status(404).json({ success: false, message: 'Station not found' });
      return;
    }

    if (
      req.user!.role !== 'admin' &&
      station.operator.toString() !== req.user!._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete stations that you own',
      });
      return;
    }

    // Cascade delete associated charging points and slots
    await ChargingPoint.deleteMany({ station: station._id });
    await Slot.deleteMany({ station: station._id });
    await station.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Station and its associated chargers/slots have been deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete station',
    });
  }
};
