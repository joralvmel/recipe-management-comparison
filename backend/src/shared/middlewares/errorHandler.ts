// src/shared/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[Error] ${err.message}`);

  if (res.headersSent) {
    return next(err);
  }
  const status = err.response?.status || err.status || 500;

  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
};
