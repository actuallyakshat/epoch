import { getRedis } from '../config/redis';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export async function saveData(key: string, value: any): Promise<void> {
  const redis = getRedis();
  const jsonString = JSON.stringify(value);
  const compressedData = await gzip(jsonString);

  logger.debug(`Redis SET key: ${key} (${compressedData.length} bytes, TTL: ${config.dataTTL}s)`);
  await redis.set(key, compressedData, 'EX', config.dataTTL);
}

export async function getData(key: string): Promise<any> {
  const redis = getRedis();
  logger.debug(`Redis GET key: ${key}`);

  const data = await redis.getBuffer(key);

  if (!data) {
    logger.debug(`Redis GET result: null (key not found or expired)`);
    return null;
  }

  logger.debug(`Redis GET result: ${data.length} bytes`);
  const decompressedData = await gunzip(data);
  return JSON.parse(decompressedData.toString());
}

export async function deleteData(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
}

export async function keyExists(key: string): Promise<boolean> {
  const redis = getRedis();
  const result = await redis.exists(key);
  return result === 1;
}
