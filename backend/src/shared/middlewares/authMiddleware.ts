import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: Record<string, unknown>;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof decoded === 'object' && decoded !== null) {
      req.user = decoded as Record<string, unknown>;
    } else {
      res.status(401).json({ error: 'Token invalid' });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid' });
  }
};
