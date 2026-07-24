import logger from '../utils/logger.js';

const connectDB = async () => {
  logger.info('Usando almacenamiento local de archivos');
  return true;
};

export default connectDB;
