import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@shared/errors/customErrors';

export interface AuthenticatedRequest extends Request {
  user?: Record<string, unknown>;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof decoded === 'object' && decoded !== null) {
      req.user = decoded as Record<string, unknown>;
    } else {
      return next(new UnauthorizedError('Invalid token'));
    }
    next();
  } catch {
    next(new UnauthorizedError('Invalid token'));
  }
};
