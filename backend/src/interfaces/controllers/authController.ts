import type { Request, Response, NextFunction } from 'express';
import { registerUser } from '@application/usecases/registerUser';
import { loginUser } from '@application/usecases/loginUser';
import { getUsernameById } from '@application/usecases/getUsernameById';
import { AuthService } from '@application/services/authService';
import type { RegisterUserDTO, LoginUserDTO } from '@shared/dtos/UserDTO';
import { UserRepository } from '@infrastructure/repositories/userRepository';
import { ResourceNotFoundError } from '@shared/errors/customErrors';

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

const registerUserUseCase = new registerUser(authService);
const loginUserUseCase = new loginUser(authService);
const getUsernameByIdUseCase = new getUsernameById(authService);

export const registerController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body as RegisterUserDTO;
    const user = await registerUserUseCase.execute(name, email, password);
    res.status(201).json(user);
  } catch (error: unknown) {
    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginUserDTO;
    const token = await loginUserUseCase.execute(email, password);
    res.status(200).json(token);
  } catch (error: unknown) {
    next(error);
  }
};

export const getUsernameController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const result = await getUsernameByIdUseCase.execute(userId);
    res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
};
