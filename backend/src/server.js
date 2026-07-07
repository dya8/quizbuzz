require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// ─── Ensure Required Directories Exist ───────────────────────────────────────
const requiredDirs = ['uploads', 'uploads/pdfs', 'logs'];
requiredDirs.forEach((dir) => {
  if (!fs.existsSync(path.join(process.cwd(), dir))) {
    fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════════╗
║        Quiz Generation Platform API              ║
║  Server running on http://localhost:${PORT}        ║
║  Environment: ${process.env.NODE_ENV || 'development'}                   ║
╚══════════════════════════════════════════════════╝
      `);
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
        logger.info('Server shut down cleanly.');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ─── Unhandled Promise Rejections ─────────────────────────────────────────
    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${promise} - reason: ${reason}`);
      gracefulShutdown('unhandledRejection');
    });

    // ─── Uncaught Exceptions ──────────────────────────────────────────────────
    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught Exception: ${error.message}`);
      gracefulShutdown('uncaughtException');
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();