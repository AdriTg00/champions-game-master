import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const env = (key, fallback) => {
  const val = process.env[key] ?? fallback;
  if (val === undefined) {
    console.error(`FATAL: Missing required env var: ${key}`);
    process.exit(1);
  }
  return val;
};

const warnEnv = (key, fallback) => {
  const val = process.env[key] ?? fallback;
  if (!process.env[key]) {
    console.warn(`WARNING: ${key} not set. Using development fallback. Set ${key} in production.`);
  }
  return val;
};

export const config = {
  port: parseInt(process.env.PORT, 10) || 8080,
  mongoUri: env('MONGO_URI'),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG'),
  rawgApiKey: process.env.RAWG_API_KEY,
  igdbClientId: process.env.IGDB_CLIENT_ID,
  igdbClientSecret: process.env.IGDB_CLIENT_SECRET,
  steamApiKey: process.env.STEAM_API_KEY,
  isVercel: process.env.VERCEL === '1',
};
