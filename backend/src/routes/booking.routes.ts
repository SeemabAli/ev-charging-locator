import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOperatorStationBookings,
  updateBookingStatus,
} from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// EV Driver: Create reservation & View own bookings
router.post('/', authenticate, authorize('user', 'admin'), createBooking);
router.get('/my-bookings', authenticate, getMyBookings);

// Operator: View bookings on stations owned by operator
router.get(
  '/operator/station-bookings',
  authenticate,
  authorize('operator', 'admin'),
  getOperatorStationBookings
);

// Individual booking details & cancel
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/cancel', authenticate, cancelBooking);

// Operator / Admin: Update booking status
router.patch(
  '/:id/status',
  authenticate,
  authorize('operator', 'admin'),
  updateBookingStatus
);

export default router;
