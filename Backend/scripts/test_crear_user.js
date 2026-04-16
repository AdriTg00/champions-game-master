// scripts/test-create-user.js
import 'dotenv/config';
import connectDB from '../config/db.js';
import UserDAO from '../repo/userDAO.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const testCreateUser = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    const userDAO = new UserDAO();

    const userData = {
      username: 'jugador1',
      email: 'jugador1@test.com',
      password: await bcrypt.hash('password123', 10)
    };

    const newUser = await userDAO.create(userData);
    console.log('Usuario creado:', newUser.toJSON());

    const allUsers = await userDAO.findAll();
    console.log('\nTotal de usuarios:', allUsers.length);
    allUsers.forEach(user => {
      console.log('  -', user.toJSON());
    });

    await mongoose.connection.close();
    console.log('\nConexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testCreateUser();