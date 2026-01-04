import { Request, Response, NextFunction } from 'express';
import { ImportRequest, ImportResponse } from '../types';
import { getData } from '../services/redisService';
import { logger } from '../utils/logger';
import { hashCode } from '../services/hashService';

export async function importData(req: Request, res: Response, next: NextFunction) {
  try {
    const { code }: ImportRequest = req.body;

    if (!code) {
      logger.debug('Import failed: Missing code field');
      return res.status(400).json({ error: 'Missing code field' });
    }

    if (typeof code !== 'string' || code.length !== 8) {
      logger.debug(`Import failed: Invalid code format - "${code}"`);
      return res.status(400).json({ error: 'Invalid code format' });
    }

    logger.debug(`Attempting to import with code: ${code}`);

    const hashedCode = await hashCode(code);
    logger.debug(`Looking up Redis key: ${hashedCode}`);

    const data = await getData(hashedCode);

    if (!data) {
      logger.warn(
        `Import failed - code not found: ${code} (hash: ${hashedCode.substring(0, 16)}...)`,
      );
      return res.status(404).json({ error: 'Data not found or expired' });
    }

    logger.info(`Imported data with code: ${code} (hash: ${hashedCode.substring(0, 16)}...)`);

    const response: ImportResponse = {
      data,
    };

    return res.json(response);
  } catch (error) {
    logger.error('Import error:', error);
    return next(error);
  }
}
