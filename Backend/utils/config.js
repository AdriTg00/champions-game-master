import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const required = (key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return process.env[key];
};

export const config = {
  port: parseInt(process.env.PORT, 10) || 8080,
  mongoUri: required('MONGO_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG'),
  rawgApiKey: process.env.RAWG_API_KEY,
  isVercel: process.env.VERCEL === '1',
};
