import { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '@application/usecases/registerUser';
import { LoginUser } from '@application/usecases/loginUser';
import { AuthService } from '@application/services/authService';
import { UserRepository } from '@infrastructure/repositories/userRepository';

const authService = new AuthService();
const userRepository = new UserRepository();

const registerUserUseCase = new RegisterUser(authService, userRepository);
const loginUserUseCase = new LoginUser(authService);

export const registerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUserUseCase.execute(name, email, password);
    res.status(201).json(user);
  } catch (error: unknown) {
    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const token = await loginUserUseCase.execute(email, password);
    res.status(200).json(token);
  } catch (error: unknown) {
    next(error);
  }
};
