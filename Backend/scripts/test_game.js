import 'dotenv/config';
import connectDB from '../config/db.js';
import GameDAO from '../dao/GameDao.js';
import mongoose from 'mongoose';

const testCreateGame = async () => {
  try {
    // 1. Conectar a MongoDB
    await connectDB(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    // 2. Instanciar DAO
    const gameDAO = new GameDAO();

    // 3. Datos del juego a crear
    const gameData = {
      name: "The Legend of Zelda",
      description: "Juego de aventura"
    };

    // 4. Crear juego
    const newGame = await gameDAO.create(gameData);
    console.log('Juego creado:', newGame.toJSON());

    // 5. Obtener todos los juegos
    const { data: allGames, total } = await gameDAO.findAll();
    console.log(`\nTotal de juegos: ${total}`);

    allGames.forEach(game => {
      console.log('  -', game.toJSON());
    });

    // 6. Cerrar conexión
    await mongoose.connection.close();
    console.log('\nConexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testCreateGame();
