import { createApp } from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const app = createApp();
  const PORT = parseInt(ENV.PORT, 10);

  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`⚡ EV ChargePoint API Server Started`);
    console.log(`🌐 Server URL:    http://localhost:${PORT}`);
    console.log(`🩺 Health Check:  http://localhost:${PORT}/api/health`);
    console.log(`🌱 Environment:   ${ENV.NODE_ENV}`);
    console.log(`===============================================`);
  });

  // Graceful shutdown
  const handleShutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('Server process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
};

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
