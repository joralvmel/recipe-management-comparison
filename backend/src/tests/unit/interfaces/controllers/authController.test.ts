import { registerController, loginController } from '@interfaces/controllers/authController';
import type { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '@application/usecases/registerUser';
import { LoginUser } from '@application/usecases/loginUser';
import type { RegisterUserDTO, LoginUserDTO } from '@shared/dtos/UserDTO';

jest.mock('@application/usecases/registerUser');
jest.mock('@application/usecases/loginUser');
jest.mock('@application/services/authService');

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('registerController', () => {
    it('should register a user and return the user data', async () => {
      const user = { id: '1', name: 'Test User', email: 'test@example.com' };
      (RegisterUser.prototype.execute as jest.Mock).mockResolvedValue(user);

      req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' } as RegisterUserDTO;

      await registerController(req as Request, res as Response, next);

      expect(RegisterUser.prototype.execute).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should call next with an error if registration fails', async () => {
      const error = new Error('Registration failed');
      (RegisterUser.prototype.execute as jest.Mock).mockRejectedValue(error);

      req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' } as RegisterUserDTO;

      await registerController(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('loginController', () => {
    it('should login a user and return a token', async () => {
      const token = 'jwt-token';
      (LoginUser.prototype.execute as jest.Mock).mockResolvedValue(token);

      req.body = { email: 'test@example.com', password: 'password123' } as LoginUserDTO;

      await loginController(req as Request, res as Response, next);

      expect(LoginUser.prototype.execute).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(token);
    });

    it('should call next with an error if login fails', async () => {
      const error = new Error('Login failed');
      (LoginUser.prototype.execute as jest.Mock).mockRejectedValue(error);

      req.body = { email: 'test@example.com', password: 'password123' } as LoginUserDTO;

      await loginController(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
