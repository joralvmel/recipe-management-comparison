import { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '@application/usecases/registerUser';
import { LoginUser } from '@application/usecases/loginUser';
import { AuthService } from '@application/services/authService';
import { RegisterUserDTO, LoginUserDTO } from '@shared/dtos/UserDTO';

const authService = new AuthService();

const registerUserUseCase = new RegisterUser(authService);
const loginUserUseCase = new LoginUser(authService);

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
