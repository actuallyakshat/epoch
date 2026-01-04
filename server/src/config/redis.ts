import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export async function setupRedis() {
  try {
    logger.info(`Attempting to connect to Redis at ${config.redisUrl}...`);

    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 1,
    });

    redis.on('error', (err: any) => {
      logger.error(`Redis Client Error: ${err.message}`);
    });

    await redis.ping();
    logger.info('Redis connection established');
  } catch (error: any) {
    logger.error(`Failed to connect to Redis at ${config.redisUrl}: ${error.message}`);
    throw error;
  }
}

export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
}
