import { Request, Response, NextFunction } from 'express';
import { CustomError } from '@shared/errors/customErrors';

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[Error] ${err.message}`);

  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;

  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
};
