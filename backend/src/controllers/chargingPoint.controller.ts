import { Request, Response } from 'express';
import { ChargingPoint } from '../models/ChargingPoint';
import { Station } from '../models/Station';
import { Slot } from '../models/Slot';
import { AuthRequest } from '../middleware/auth.middleware';

// 1. Get charging points for a specific station
export const getChargingPointsByStation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { stationId } = req.params;
    const chargingPoints = await ChargingPoint.find({ station: stationId });

    res.status(200).json({
      success: true,
      count: chargingPoints.length,
      data: chargingPoints,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch charging points',
    });
  }
};

// 2. Add charging point to station (Operator owner or Admin)
export const createChargingPoint = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { stationId } = req.params;
    const { identifier, connectorType, powerKw, pricingPerKwh, status } = req.body;

    const station = await Station.findById(stationId);
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
        message: 'Forbidden: You can only add chargers to your own stations',
      });
      return;
    }

    if (!identifier || !connectorType || !powerKw) {
      res.status(400).json({
        success: false,
        message: 'Identifier, connector type, and power in kW are required',
      });
      return;
    }

    const existingCharger = await ChargingPoint.findOne({
      station: stationId,
      identifier: identifier.trim(),
    });

    if (existingCharger) {
      res.status(400).json({
        success: false,
        message: `A charger with identifier '${identifier}' already exists at this station`,
      });
      return;
    }

    const chargingPoint = await ChargingPoint.create({
      station: stationId,
      identifier: identifier.trim(),
      connectorType,
      powerKw: Number(powerKw),
      pricingPerKwh: pricingPerKwh !== undefined ? Number(pricingPerKwh) : 0.35,
      status: status || 'available',
    });

    res.status(201).json({
      success: true,
      message: 'Charging point added successfully',
      data: chargingPoint,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add charging point',
    });
  }
};

// 3. Update charging point details or status
export const updateChargingPoint = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { identifier, connectorType, powerKw, pricingPerKwh, status } = req.body;

    const chargingPoint = await ChargingPoint.findById(id).populate('station');
    if (!chargingPoint) {
      res.status(404).json({ success: false, message: 'Charging point not found' });
      return;
    }

    const station: any = chargingPoint.station;
    if (
      req.user!.role !== 'admin' &&
      station.operator.toString() !== req.user!._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update chargers on your own stations',
      });
      return;
    }

    if (identifier) chargingPoint.identifier = identifier.trim();
    if (connectorType) chargingPoint.connectorType = connectorType;
    if (powerKw !== undefined) chargingPoint.powerKw = Number(powerKw);
    if (pricingPerKwh !== undefined) chargingPoint.pricingPerKwh = Number(pricingPerKwh);
    if (status) chargingPoint.status = status;

    await chargingPoint.save();

    res.status(200).json({
      success: true,
      message: 'Charging point updated successfully',
      data: chargingPoint,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update charging point',
    });
  }
};

// 4. Delete charging point
export const deleteChargingPoint = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const chargingPoint = await ChargingPoint.findById(id).populate('station');

    if (!chargingPoint) {
      res.status(404).json({ success: false, message: 'Charging point not found' });
      return;
    }

    const station: any = chargingPoint.station;
    if (
      req.user!.role !== 'admin' &&
      station.operator.toString() !== req.user!._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete chargers on your own stations',
      });
      return;
    }

    await Slot.deleteMany({ chargingPoint: chargingPoint._id });
    await chargingPoint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Charging point and its associated slots have been deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete charging point',
    });
  }
};
