import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '@application/services/authService';
import { UserRepository } from '@infrastructure/repositories/userRepository';
import { User } from '@domain/entities/User';
import {
  InternalServerError,
  ResourceAlreadyExistsError,
  BadRequestError,
  UnauthorizedError,
} from '@shared/errors/customErrors';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@infrastructure/repositories/userRepository');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    authService = new AuthService();
    authService['userRepository'] = userRepository;
  });

  describe('registerUser', () => {
    it('should throw BadRequestError if name is not provided', async () => {
      await expect(authService.registerUser('', 'test@example.com', 'password')).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if email is not provided', async () => {
      await expect(authService.registerUser('Test', '', 'password')).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if password is not provided', async () => {
      await expect(authService.registerUser('Test', 'test@example.com', '')).rejects.toThrow(BadRequestError);
    });

    it('should throw ResourceAlreadyExistsError if user already exists', async () => {
      userRepository.findUserByEmail.mockResolvedValue({} as User);
      await expect(authService.registerUser('Test', 'test@example.com', 'password')).rejects.toThrow(
        ResourceAlreadyExistsError,
      );
    });

    it('should create a new user and return user details', async () => {
      userRepository.findUserByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      userRepository.createUser.mockResolvedValue({ _id: '1', name: 'Test', email: 'test@example.com' } as User);

      const result = await authService.registerUser('Test', 'test@example.com', 'password');

      expect(result).toEqual({ id: '1', name: 'Test', email: 'test@example.com' });
    });

    it('should throw InternalServerError if user creation fails', async () => {
      userRepository.findUserByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      userRepository.createUser.mockResolvedValue({} as User);

      await expect(authService.registerUser('Test', 'test@example.com', 'password')).rejects.toThrow(
        InternalServerError,
      );
    });
  });

  describe('loginUser', () => {
    it('should throw UnauthorizedError if user is not found', async () => {
      userRepository.findUserByEmail.mockResolvedValue(null);
      await expect(authService.loginUser('test@example.com', 'password')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if password is invalid', async () => {
      userRepository.findUserByEmail.mockResolvedValue({ passwordHash: 'hashedPassword' } as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(authService.loginUser('test@example.com', 'password')).rejects.toThrow(UnauthorizedError);
    });

    it('should return a token if credentials are valid', async () => {
      userRepository.findUserByEmail.mockResolvedValue({
        _id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      } as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await authService.loginUser('test@example.com', 'password');

      expect(result).toEqual({ token: 'token' });
    });
  });
});
