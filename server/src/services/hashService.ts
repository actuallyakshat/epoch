import crypto from 'crypto';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export async function hashCode(code: string): Promise<string> {
  const hash = crypto.createHmac('sha256', config.hashSecret).update(code).digest('hex');

  logger.debug(`Hash generated for code "${code}": ${hash}`);
  return hash;
}

export async function verifyCode(code: string, hash: string): Promise<boolean> {
  const computedHash = await hashCode(code);
  return computedHash === hash;
}
