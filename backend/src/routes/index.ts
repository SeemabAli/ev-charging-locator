import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// Root API index info
router.get('/', (_req, res) => {
  res.json({
    name: 'EV ChargePoint REST API',
    version: '1.0.0',
    documentation: '/api/docs (coming in Phase 2)',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth (Phase 2)',
      stations: '/api/stations (Phase 2)',
      slots: '/api/slots (Phase 2)',
      bookings: '/api/bookings (Phase 2)',
      admin: '/api/admin (Phase 2)',
    },
  });
});

// Health check route
router.use('/', healthRoutes);

export default router;
