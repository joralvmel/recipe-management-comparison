import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@application/services/authService';

const authService = new AuthService();

export const registerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const user = await authService.registerUser(name, email, password);
    res.status(201).json(user);
  } catch (error: unknown) {
    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const token = await authService.loginUser(email, password);
    res.status(200).json(token);
  } catch (error: unknown) {
    next(error);
  }
};
