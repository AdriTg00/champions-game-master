// index.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import gameRoutes from './routes/game.routes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://adriantarancon.dev',
  'https://www.adriantarancon.dev',
  'https://champions-game-master.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB(process.env.MONGO_URI);
      isConnected = true;
    } catch (err) {
      console.error('Error conectando con MongoDB:', err);
      return res.status(500).json({ error: 'Error conectando con la base de datos' });
    }
  }
  next();
});

// rutas
app.get('/', (req, res) => {
  res.json({ message: 'Api funcionando correctamente' });
});

app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

export default app;