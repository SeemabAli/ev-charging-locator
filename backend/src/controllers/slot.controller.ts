import { Request, Response } from 'express';
import { Slot } from '../models/Slot';
import { ChargingPoint } from '../models/ChargingPoint';
import { AuthRequest } from '../middleware/auth.middleware';

// 1. Get slots for a charging point on a given date
export const getSlotsByChargerAndDate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chargingPointId } = req.params;
    const { date } = req.query;

    const query: any = { chargingPoint: chargingPointId };
    if (date && typeof date === 'string') {
      query.date = date;
    }

    const slots = await Slot.find(query).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve slots',
    });
  }
};

// 2. Create single slot (Operator owner or Admin)
export const createSlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chargingPointId } = req.params;
    const { date, startTime, endTime } = req.body;

    const charger = await ChargingPoint.findById(chargingPointId).populate('station');
    if (!charger) {
      res.status(404).json({ success: false, message: 'Charging point not found' });
      return;
    }

    const station: any = charger.station;
    if (
      req.user!.role !== 'admin' &&
      station.operator.toString() !== req.user!._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only define slots for your own charging points',
      });
      return;
    }

    if (!date || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        message: 'Date (YYYY-MM-DD), startTime (HH:mm), and endTime (HH:mm) are required',
      });
      return;
    }

    const existingSlot = await Slot.findOne({
      chargingPoint: chargingPointId,
      date,
      startTime,
    });

    if (existingSlot) {
      res.status(400).json({
        success: false,
        message: `A slot for date ${date} starting at ${startTime} already exists`,
      });
      return;
    }

    const slot = await Slot.create({
      chargingPoint: chargingPointId,
      station: station._id,
      date,
      startTime,
      endTime,
      isBooked: false,
    });

    res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data: slot,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create slot',
    });
  }
};

// 3. Bulk generate hourly slots for a date range (Convenience tool for Operators)
export const generateDailySlots = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { chargingPointId } = req.params;
    const { date, startHour = 8, endHour = 20, slotDurationHours = 1 } = req.body;

    const charger = await ChargingPoint.findById(chargingPointId).populate('station');
    if (!charger) {
      res.status(404).json({ success: false, message: 'Charging point not found' });
      return;
    }

    const station: any = charger.station;
    if (
      req.user!.role !== 'admin' &&
      station.operator.toString() !== req.user!._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only define slots for your own stations',
      });
      return;
    }

    if (!date) {
      res.status(400).json({
        success: false,
        message: 'Date is required (YYYY-MM-DD)',
      });
      return;
    }

    const createdSlots = [];
    const step = Number(slotDurationHours);

    for (let h = Number(startHour); h < Number(endHour); h += step) {
      const startH = h.toString().padStart(2, '0') + ':00';
      const endH = (h + step).toString().padStart(2, '0') + ':00';

      // Check if slot already exists
      const existing = await Slot.findOne({
        chargingPoint: chargingPointId,
        date,
        startTime: startH,
      });

      if (!existing) {
        const slot = await Slot.create({
          chargingPoint: chargingPointId,
          station: station._id,
          date,
          startTime: startH,
          endTime: endH,
          isBooked: false,
        });
        createdSlots.push(slot);
      }
    }

    res.status(201).json({
      success: true,
      message: `Generated ${createdSlots.length} available slots for date ${date}`,
      count: createdSlots.length,
      data: createdSlots,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate daily slots',
    });
  }
};

// 4. Delete slot (Operator owner or Admin)
export const deleteSlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const slot = await Slot.findById(id).populate('station');

    if (!slot) {
      res.status(404).json({ success: false, message: 'Slot not found' });
      return;
    }

    const station: any = slot.station;
    if (
      req.user!.role !== 'admin' &&
      station.operator.toString() !== req.user!._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete slots for your own stations',
      });
      return;
    }

    if (slot.isBooked) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete a slot that is already booked by a customer',
      });
      return;
    }

    await slot.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Slot removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete slot',
    });
  }
};
