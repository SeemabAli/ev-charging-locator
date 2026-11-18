import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './config/env';
import apiRouter from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: [ENV.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Base test route
  app.get('/', (_req, res) => {
    res.json({
      message: '⚡ Welcome to EV ChargePoint API Server',
      status: 'online',
      healthCheck: '/api/health',
    });
  });

  // API Routes
  app.use('/api', apiRouter);

  // 404 & Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
