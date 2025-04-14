import { registerController, loginController, getUsernameController } from '@interfaces/controllers/authController';
import type { Request, Response, NextFunction } from 'express';
import { registerUser } from '@application/usecases/registerUser';
import { loginUser } from '@application/usecases/loginUser';
import { getUsernameById } from '@application/usecases/getUsernameById';
import { BadRequestError } from '@shared/errors/customErrors';
import type { RegisterUserDTO, LoginUserDTO } from '@shared/dtos/UserDTO';

jest.mock('@application/usecases/registerUser');
jest.mock('@application/usecases/loginUser');
jest.mock('@application/usecases/getUsernameById');

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
      (registerUser.prototype.execute as jest.Mock).mockResolvedValue(user);

      req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' } as RegisterUserDTO;

      await registerController(req as Request, res as Response, next);

      expect(registerUser.prototype.execute).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should call next with an error if registration fails', async () => {
      const error = new Error('Registration failed');
      (registerUser.prototype.execute as jest.Mock).mockRejectedValue(error);

      req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' } as RegisterUserDTO;

      await registerController(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('loginController', () => {
    it('should login a user and return a token', async () => {
      const token = { token: 'jwt-token' };
      (loginUser.prototype.execute as jest.Mock).mockResolvedValue(token);

      req.body = { email: 'test@example.com', password: 'password123' } as LoginUserDTO;

      await loginController(req as Request, res as Response, next);

      expect(loginUser.prototype.execute).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(token);
    });

    it('should call next with an error if login fails', async () => {
      const error = new Error('Login failed');
      (loginUser.prototype.execute as jest.Mock).mockRejectedValue(error);

      req.body = { email: 'test@example.com', password: 'password123' } as LoginUserDTO;

      await loginController(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUsernameController', () => {
    it('should return the username for a given user ID', async () => {
      const result = { username: 'Test User' };
      (getUsernameById.prototype.execute as jest.Mock).mockResolvedValue(result);

      req.params = { userId: '507f1f77bcf86cd799439011' };

      await getUsernameController(req as Request, res as Response, next);

      expect(getUsernameById.prototype.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('should call next with an error if retrieving the username fails', async () => {
      const error = new Error('User not found');
      (getUsernameById.prototype.execute as jest.Mock).mockRejectedValue(error);

      req.params = { userId: '507f1f77bcf86cd799439011' };

      await getUsernameController(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next with BadRequestError if the user ID format is invalid', async () => {
      const invalidUserId = 'invalidUserId';
      const error = new BadRequestError('Invalid user ID');
      (getUsernameById.prototype.execute as jest.Mock).mockRejectedValue(error);

      req.params = { userId: invalidUserId };

      await getUsernameController(req as Request, res as Response, next);

      expect(getUsernameById.prototype.execute).toHaveBeenCalledWith(invalidUserId);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
