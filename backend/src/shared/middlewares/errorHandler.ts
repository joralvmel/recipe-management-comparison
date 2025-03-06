import type { Request, Response, NextFunction } from 'express';
import type { CustomError } from '@shared/errors/customErrors';

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[Error] ${err.message}`);

  if (res.headersSent) {
    next(err);
    return;
  }
  const status = err.status || 500;

  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
};
