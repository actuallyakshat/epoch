import dotenv from 'dotenv';
import path from 'path';

// Load .env file before anything else
const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

export function loadEnv() {
  const requiredVars = ['REDIS_URL', 'HASH_SECRET'];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  redisUrl: process.env.REDIS_URL!,
  hashSecret: process.env.HASH_SECRET!,
  dataTTL: 300,
  maxDataSize: process.env.MAX_DATA_SIZE || '1mb',
  rateLimitWindowMs: 15 * 60 * 1000,
  rateLimitMax: 100,
};
