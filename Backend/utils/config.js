import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

export const config = {
  port: parseInt(process.env.PORT, 10) || 8080,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG'),
  rawgApiKey: process.env.RAWG_API_KEY,
  isVercel: process.env.VERCEL === '1',
};
