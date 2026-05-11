import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/user.routes.js';
import gameRoutes from './routes/game.routes.js';
import { apiLimiter } from './middleware/rateLimit.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'Api funcionando correctamente' });
});

app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      logger.info(`✅ Servidor corriendo en http://localhost:${PORT}`);
      logger.info(`📡 API disponible en http://localhost:${PORT}/api`);
    });
  } catch (err) {
    logger.error('Error arrancando server:', err);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

start();