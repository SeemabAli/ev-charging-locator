import { Response } from 'express';
import { Booking, BookingStatus } from '../models/Booking';
import { Slot } from '../models/Slot';
import { ChargingPoint } from '../models/ChargingPoint';
import { Station } from '../models/Station';
import { AuthRequest } from '../middleware/auth.middleware';

// 1. Create a reservation (Guaranteed double-booking prevention at Database level)
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const { slotId } = req.body;

  if (!slotId) {
    res.status(400).json({ success: false, message: 'slotId is required' });
    return;
  }

  let slotLocked = false;

  try {
    // ATOMIC DATABASE LOCK:
    // Atomic update will succeed for EXACTLY ONE user even if 100 concurrent requests hit this line simultaneously
    const lockedSlot = await Slot.findOneAndUpdate(
      { _id: slotId, isBooked: false },
      { $set: { isBooked: true } },
      { new: true }
    );

    if (!lockedSlot) {
      res.status(409).json({
        success: false,
        message: 'This time slot is no longer available. Another customer may have just reserved it.',
      });
      return;
    }

    slotLocked = true;

    // Fetch charger info for pricing calculation
    const charger = await ChargingPoint.findById(lockedSlot.chargingPoint);
    if (!charger) {
      // Rollback slot lock
      await Slot.findByIdAndUpdate(slotId, { isBooked: false });
      res.status(404).json({ success: false, message: 'Charging point not found' });
      return;
    }

    if (charger.status === 'maintenance') {
      await Slot.findByIdAndUpdate(slotId, { isBooked: false });
      res.status(400).json({
        success: false,
        message: 'This charger is currently undergoing maintenance and cannot be reserved.',
      });
      return;
    }

    // Estimate total amount: 1-hour session avg ~ 25 kWh * pricingPerKwh (minimum $5.00)
    const estimatedKwh = Math.max(15, Math.min(50, charger.powerKw * 0.5));
    const calculatedTotal = parseFloat((estimatedKwh * charger.pricingPerKwh).toFixed(2));

    const booking = await Booking.create({
      user: req.user!._id,
      station: lockedSlot.station,
      chargingPoint: lockedSlot.chargingPoint,
      slot: lockedSlot._id,
      date: lockedSlot.date,
      startTime: lockedSlot.startTime,
      endTime: lockedSlot.endTime,
      totalAmount: calculatedTotal,
      status: 'confirmed',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('station', 'name address city location')
      .populate('chargingPoint', 'identifier connectorType powerKw')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Charging slot reserved successfully! Zero collision guaranteed.',
      data: populatedBooking,
    });
  } catch (error: any) {
    // If anything fails during document creation, safely release the slot lock
    if (slotLocked) {
      await Slot.findByIdAndUpdate(slotId, { isBooked: false });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete booking reservation',
    });
  }
};

// 2. Get logged in EV user's bookings history
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user!._id })
      .populate('station', 'name address city location operatingHours')
      .populate('chargingPoint', 'identifier connectorType powerKw pricingPerKwh')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch your bookings',
    });
  }
};

// 3. Get single booking details
export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('station')
      .populate('chargingPoint')
      .populate('user', 'name email phone');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Access check: User who owns the booking, or Admin, or Operator who owns the station
    const isOwner = booking.user._id.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    let isStationOperator = false;
    if (req.user!.role === 'operator') {
      const station = await Station.findById(booking.station);
      if (station && station.operator.toString() === req.user!._id.toString()) {
        isStationOperator = true;
      }
    }

    if (!isOwner && !isAdmin && !isStationOperator) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this booking',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve booking',
    });
  }
};

// 4. Cancel a booking (Driver or Operator)
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    const isOwner = booking.user.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    let isStationOperator = false;
    if (req.user!.role === 'operator') {
      const station = await Station.findById(booking.station);
      if (station && station.operator.toString() === req.user!._id.toString()) {
        isStationOperator = true;
      }
    }

    if (!isOwner && !isAdmin && !isStationOperator) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot cancel this booking',
      });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'This booking is already cancelled',
      });
      return;
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by user/operator';
    await booking.save();

    // Release the slot back into available pool
    await Slot.findByIdAndUpdate(booking.slot, { isBooked: false });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully and slot released',
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel booking',
    });
  }
};

// 5. Operator: Get all bookings for stations owned by the operator
export const getOperatorStationBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Find all stations owned by this operator
    const myStations = await Station.find({ operator: req.user!._id }).select('_id');
    const stationIds = myStations.map((s) => s._id);

    const bookings = await Booking.find({ station: { $in: stationIds } })
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
      message: error.message || 'Failed to fetch station bookings',
    });
  }
};

// 6. Update booking status (Operator or Admin: pending, confirmed, completed, cancelled)
export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: BookingStatus[] = [
      'pending',
      'confirmed',
      'completed',
      'cancelled',
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    booking.status = status;
    await booking.save();

    // If marked cancelled or completed, release the slot if cancelled
    if (status === 'cancelled') {
      await Slot.findByIdAndUpdate(booking.slot, { isBooked: false });
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update booking status',
    });
  }
};
