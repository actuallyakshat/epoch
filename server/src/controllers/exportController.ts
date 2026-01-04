import { Request, Response, NextFunction } from 'express';
import { ExportRequest, ExportResponse } from '../types';
import { generateCode } from '../services/codeService';
import { hashCode } from '../services/hashService';
import { saveData } from '../services/redisService';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export async function exportData(req: Request, res: Response, next: NextFunction) {
  try {
    const { data }: ExportRequest = req.body;

    if (!data) {
      logger.debug('Export failed: Missing data field');
      return res.status(400).json({ error: 'Missing data field' });
    }

    if (typeof data !== 'object' || data === null) {
      logger.debug('Export failed: Data must be an object');
      return res.status(400).json({ error: 'Data must be an object' });
    }

    const code = generateCode();
    logger.debug(`Generated code: ${code}`);

    const hashedCode = await hashCode(code);
    logger.debug(`Hashed code: ${hashedCode}`);

    const expiresAt = new Date(Date.now() + config.dataTTL * 1000).toISOString();

    await saveData(hashedCode, data);
    logger.debug(`Saved data to Redis with key: ${hashedCode}`);

    logger.info(`Exported data with code: ${code} (hash: ${hashedCode.substring(0, 16)}...)`);

    const response: ExportResponse = {
      code,
      expiresAt,
    };

    return res.json(response);
  } catch (error) {
    logger.error('Export error:', error);
    return next(error);
  }
}
