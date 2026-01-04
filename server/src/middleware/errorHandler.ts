import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ErrorResponse } from '../types';

export function errorHandler(error: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error(`Error on ${req.method} ${req.path}:`, error);

  const response: ErrorResponse = {
    error: error.name || 'Internal Server Error',
    message: error.message,
  };

  const statusCode = (error as any).statusCode || 500;

  res.status(statusCode).json(response);
}
