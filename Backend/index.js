// index.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import gameRoutes from './routes/game.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// rutas
app.get('/', (req, res) => {
  res.json({ message: 'Api funcionando correctamente' });
});
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Error arrancando server:', err);
    process.exit(1);
  }
};

start();
