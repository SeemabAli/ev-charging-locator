import { Router } from 'express';
import {
  getAllStations,
  getNearbyStations,
  getStationById,
  createStation,
  getMyStations,
  updateStation,
  deleteStation,
} from '../controllers/station.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllStations);
router.get('/nearby', getNearbyStations);

// Operator protected routes
router.get(
  '/operator/my-stations',
  authenticate,
  authorize('operator', 'admin'),
  getMyStations
);

router.get('/:id', getStationById);

router.post(
  '/',
  authenticate,
  authorize('operator', 'admin'),
  createStation
);

router.put(
  '/:id',
  authenticate,
  authorize('operator', 'admin'),
  updateStation
);

router.delete(
  '/:id',
  authenticate,
  authorize('operator', 'admin'),
  deleteStation
);

export default router;
