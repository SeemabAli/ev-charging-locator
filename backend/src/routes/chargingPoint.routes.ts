import { Router } from 'express';
import {
  getChargingPointsByStation,
  createChargingPoint,
  updateChargingPoint,
  deleteChargingPoint,
} from '../controllers/chargingPoint.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Get chargers for a station
router.get('/station/:stationId', getChargingPointsByStation);

// Operator / Admin management
router.post(
  '/station/:stationId',
  authenticate,
  authorize('operator', 'admin'),
  createChargingPoint
);

router.put(
  '/:id',
  authenticate,
  authorize('operator', 'admin'),
  updateChargingPoint
);

router.delete(
  '/:id',
  authenticate,
  authorize('operator', 'admin'),
  deleteChargingPoint
);

export default router;
