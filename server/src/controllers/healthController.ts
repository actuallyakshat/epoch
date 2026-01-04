import { Request, Response } from 'express';
import { HealthResponse } from '../types';

export async function healthCheck(_req: Request, res: Response) {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    redis: 'connected',
  };
  res.json(response);
}
