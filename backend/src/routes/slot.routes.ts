import { Router } from 'express';
import {
  getSlotsByChargerAndDate,
  createSlot,
  generateDailySlots,
  deleteSlot,
} from '../controllers/slot.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public: view slots for charger
router.get('/charger/:chargingPointId', getSlotsByChargerAndDate);

// Operator / Admin: create single slot
router.post(
  '/charger/:chargingPointId',
  authenticate,
  authorize('operator', 'admin'),
  createSlot
);

// Operator / Admin: bulk generate daily slots
router.post(
  '/charger/:chargingPointId/generate-daily',
  authenticate,
  authorize('operator', 'admin'),
  generateDailySlots
);

// Operator / Admin: delete slot
router.delete(
  '/:id',
  authenticate,
  authorize('operator', 'admin'),
  deleteSlot
);

export default router;
