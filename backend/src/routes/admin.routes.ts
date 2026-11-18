import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  getAdminStations,
  updateStationStatus,
  getAllBookings,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Protect all admin routes with authentication and 'admin' role check
router.use(authenticate, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/stations', getAdminStations);
router.patch('/stations/:id/status', updateStationStatus);
router.get('/bookings', getAllBookings);

export default router;
