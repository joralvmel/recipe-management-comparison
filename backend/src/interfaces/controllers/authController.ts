import { Request, Response, NextFunction } from 'express';
import { registerUser } from '@application/usecases/registerUser';
import { loginUser } from '@application/usecases/loginUser';

export const registerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);
    res.status(201).json(user);
  } catch (error: unknown) {
    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    res.status(200).json(token);
  } catch (error: unknown) {
    next(error);
  }
};
