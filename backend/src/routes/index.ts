import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import stationRoutes from './station.routes';
import chargingPointRoutes from './chargingPoint.routes';
import slotRoutes from './slot.routes';
import bookingRoutes from './booking.routes';
import adminRoutes from './admin.routes';

const router = Router();

// API Index Directory
router.get('/', (_req, res) => {
  res.json({
    name: 'EV ChargePoint REST API',
    version: '1.0.0',
    documentation: 'https://github.com/SeemabAli/luxury-car-booking#api-documentation',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET, PUT /api/auth/profile',
      },
      stations: {
        list: 'GET /api/stations',
        nearby: 'GET /api/stations/nearby?lat={lat}&lng={lng}&maxDistanceKm={km}',
        details: 'GET /api/stations/:id',
        create: 'POST /api/stations (Operator/Admin)',
        myStations: 'GET /api/stations/operator/my-stations',
      },
      chargingPoints: {
        byStation: 'GET /api/charging-points/station/:stationId',
        create: 'POST /api/charging-points/station/:stationId (Operator/Admin)',
        update: 'PUT /api/charging-points/:id',
        delete: 'DELETE /api/charging-points/:id',
      },
      slots: {
        byCharger: 'GET /api/slots/charger/:chargingPointId?date=YYYY-MM-DD',
        create: 'POST /api/slots/charger/:chargingPointId (Operator/Admin)',
        generateDaily: 'POST /api/slots/charger/:chargingPointId/generate-daily',
        delete: 'DELETE /api/slots/:id',
      },
      bookings: {
        reserve: 'POST /api/bookings (User)',
        myBookings: 'GET /api/bookings/my-bookings (User)',
        cancel: 'PATCH /api/bookings/:id/cancel',
        operatorBookings: 'GET /api/bookings/operator/station-bookings',
        updateStatus: 'PATCH /api/bookings/:id/status',
      },
      admin: {
        stats: 'GET /api/admin/stats',
        users: 'GET /api/admin/users',
        userStatus: 'PATCH /api/admin/users/:id/status',
        stations: 'GET /api/admin/stations',
        stationStatus: 'PATCH /api/admin/stations/:id/status',
        bookings: 'GET /api/admin/bookings',
      },
    },
  });
});

// Mount modules
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/stations', stationRoutes);
router.use('/charging-points', chargingPointRoutes);
router.use('/slots', slotRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);

export default router;
