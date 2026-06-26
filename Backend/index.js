import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/user.routes.js';
import gameRoutes from './routes/game.routes.js';
import { apiLimiter } from './middleware/rateLimit.js';
import logger from './utils/logger.js';
import { config } from './utils/config.js';

const app = express();

app.use(helmet());
app.use(apiLimiter);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://championsweb.adriantarancon.dev'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'Api funcionando correctamente' });
});

app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

if (!config.isVercel) {
  let server;

  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} recibido. Iniciando cierre graceful...`);
    if (server) {
      server.close(() => {
        logger.info('Servidor HTTP cerrado');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Cierre forzado por timeout');
        process.exit(1);
      }, 10000);
    }
  };

  const start = async () => {
    try {
      await connectDB(config.mongoUri);
      server = app.listen(config.port, () => {
        logger.info(`Servidor corriendo en http://localhost:${config.port}`);
        logger.info(`API disponible en http://localhost:${config.port}/api`);
      });
    } catch (err) {
      logger.error('Error arrancando server:', { message: err.message });
      process.exit(1);
    }
  };

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', { message: reason?.message || reason });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', { message: err.message });
    gracefulShutdown('uncaughtException');
  });

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  start();
}

export default app;