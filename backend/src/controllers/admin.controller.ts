import { Response } from 'express';
import { User } from '../models/User';
import { Station } from '../models/Station';
import { Booking } from '../models/Booking';
import { ChargingPoint } from '../models/ChargingPoint';
import { AuthRequest } from '../middleware/auth.middleware';

// 1. Get system statistics overview
export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalOperators,
      totalStations,
      pendingStations,
      approvedStations,
      totalChargers,
      totalBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'operator' }),
      Station.countDocuments(),
      Station.countDocuments({ status: 'pending' }),
      Station.countDocuments({ status: 'approved' }),
      ChargingPoint.countDocuments(),
      Booking.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOperators,
        totalStations,
        pendingStations,
        approvedStations,
        totalChargers,
        totalBookings,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin stats',
    });
  }
};

// 2. View and manage registered users and operators
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, isActive, search } = req.query;

    const query: any = {};
    if (role && typeof role === 'string') query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { email: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    });
  }
};

// 3. Activate or deactivate user / operator accounts
export const updateUserStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      res.status(400).json({
        success: false,
        message: 'isActive (boolean) field is required',
      });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user._id.toString() === req.user!._id.toString()) {
      res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own admin account',
      });
      return;
    }

    user.isActive = Boolean(isActive);
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user status',
    });
  }
};

// 4. View all stations with status filters (pending/approved/rejected)
export const getAdminStations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;

    const query: any = {};
    if (status && typeof status === 'string') {
      query.status = status;
    }

    const stations = await Station.find(query)
      .populate('operator', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch stations for admin',
    });
  }
};

// 5. Approve or reject newly added charging stations
export const updateStationStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be either 'approved', 'rejected', or 'pending'",
      });
      return;
    }

    const station = await Station.findById(id);
    if (!station) {
      res.status(404).json({ success: false, message: 'Station not found' });
      return;
    }

    station.status = status;
    await station.save();

    res.status(200).json({
      success: true,
      message: `Station status has been set to '${status}'`,
      data: station,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update station approval status',
    });
  }
};

// 6. View all system booking records
export const getAllBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, date } = req.query;

    const query: any = {};
    if (status && typeof status === 'string') query.status = status;
    if (date && typeof date === 'string') query.date = date;

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('station', 'name address city')
      .populate('chargingPoint', 'identifier connectorType powerKw')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch bookings',
    });
  }
};
