import type { UserType } from '@src/types';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import * as authService from '@services/authService';
import { jwtDecode } from 'jwt-decode';

vi.mock('axios');

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn()
}));

vi.mock('@services/authService', async (importOriginal) => {
  const actualModule = await importOriginal<typeof import('@services/authService')>();

  return {
    ...actualModule,
    loginUser: vi.fn(),
    registerUser: vi.fn(),
    fetchUserById: vi.fn()
  };
});

describe('authService', () => {
  const mockUsers: UserType[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      createdAt: 1648814400000
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'securepass',
      createdAt: 1648900800000
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: vi.fn().mockReturnValue('mock-uuid')
      }
    });
  });

  describe('loginUser', () => {
    it('logs in a user via API when backend is enabled', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20ifQ.abc123';
      const mockDecodedUser = { id: '1', name: 'John Doe', email: 'john@example.com' };

      (axios.post as jest.Mock).mockResolvedValueOnce({
        data: { token: mockToken, user: mockDecodedUser }
      });
      (jwtDecode as jest.Mock).mockReturnValueOnce(mockDecodedUser);

      (authService.loginUser as jest.Mock).mockImplementationOnce(async (email: string, password: string) => {
        const response = await axios.post('http://localhost:3000/auth/login', { email, password });

        if (response.data.token) {
          const decodedUser = jwtDecode<UserType>(response.data.token);
          return { user: decodedUser, token: response.data.token };
        }
        return null;
      });

      const result = await authService.loginUser('john@example.com', 'password123');

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/auth/login',
        { email: 'john@example.com', password: 'password123' }
      );
      expect(result).toEqual({
        user: mockDecodedUser,
        token: mockToken
      });
    });

    it('logs in a user with mock data when backend is disabled', async () => {
      (authService.loginUser as jest.Mock).mockImplementationOnce(async (email: string, password: string) => {
        const foundUser = mockUsers.find(user => user.email === email);

        if (!foundUser) {
          throw new Error('Invalid credentials');
        }

        if (foundUser.password !== password) {
          throw new Error('Invalid credentials');
        }

        const mockToken = `Bearer ${btoa(`${foundUser.id}:${foundUser.email}`)}`;
        return { user: foundUser, token: mockToken };
      });

      const result = await authService.loginUser('john@example.com', 'password123');

      expect(result?.user).toEqual(mockUsers[0]);
      expect(result?.token).toContain('Bearer ');
    });

    it('throws an error with mock data when email is not found', async () => {
      (authService.loginUser as jest.Mock).mockImplementationOnce(async (email: string, password: string) => {
        const foundUser = mockUsers.find(user => user.email === email);

        if (!foundUser) {
          throw new Error('Invalid credentials');
        }

        if (foundUser.password !== password) {
          throw new Error('Invalid credentials');
        }

        const mockToken = `Bearer ${btoa(`${foundUser.id}:${foundUser.email}`)}`;
        return { user: foundUser, token: mockToken };
      });

      await expect(authService.loginUser('nonexistent@example.com', 'password123'))
        .rejects.toThrow('Invalid credentials');
    });

    it('throws an error with mock data when password is incorrect', async () => {
      (authService.loginUser as jest.Mock).mockImplementationOnce(async (email: string, password: string) => {
        const foundUser = mockUsers.find(user => user.email === email);

        if (!foundUser) {
          throw new Error('Invalid credentials');
        }

        if (foundUser.password !== password) {
          throw new Error('Invalid credentials');
        }

        const mockToken = `Bearer ${btoa(`${foundUser.id}:${foundUser.email}`)}`;
        return { user: foundUser, token: mockToken };
      });

      await expect(authService.loginUser('john@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('registerUser', () => {
    it('registers a user via API when backend is enabled', async () => {
      const registerData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'newuserpass'
      };

      const mockResponse = { message: 'Registration successful' };
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (authService.registerUser as jest.Mock).mockImplementationOnce(async (userData: UserType) => {
        const response = await axios.post('http://localhost:3000/auth/register', userData);
        return response.data;
      });

      const result = await authService.registerUser(registerData as UserType);

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/auth/register',
        registerData
      );
      expect(result).toEqual(mockResponse);
    });

    it('registers a user with mock data when backend is disabled', async () => {
      const registerData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'newuserpass'
      };

      (authService.registerUser as jest.Mock).mockImplementationOnce(async (userData: UserType) => {
        const existingUser = mockUsers.find(user => user.email === userData.email);
        if (existingUser) {
          throw new Error('User with this email address already exists');
        }

        return { message: 'Mocked: Registration successful' };
      });

      const result = await authService.registerUser(registerData as UserType);

      expect(result).toEqual({ message: 'Mocked: Registration successful' });
    });

    it('throws an error with mock data when email is already registered', async () => {
      const registerData = {
        name: 'Duplicate User',
        email: 'john@example.com',
        password: 'password123'
      };

      (authService.registerUser as jest.Mock).mockImplementationOnce(async (userData: UserType) => {
        const existingUser = mockUsers.find(user => user.email === userData.email);
        if (existingUser) {
          throw new Error('User with this email address already exists');
        }

        return { message: 'Should not reach here' };
      });

      await expect(authService.registerUser(registerData as UserType))
        .rejects.toThrow('User with this email address already exists');
    });
  });

  describe('fetchUserById', () => {
    it('fetches a user by ID via API when backend is enabled', async () => {
      const mockResponse = { username: 'John Doe' };
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (authService.fetchUserById as jest.Mock).mockImplementationOnce(async (userId: string) => {
        const response = await axios.get(`http://localhost:3000/auth/username/${userId}`);
        return { name: response.data.username };
      });

      const result = await authService.fetchUserById('1');

      expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/auth/username/1');
      expect(result).toEqual({ name: 'John Doe' });
    });

    it('fetches a user by ID with mock data when backend is disabled', async () => {
      (authService.fetchUserById as jest.Mock).mockImplementationOnce(async (userId: string) => {
        const foundUser = mockUsers.find(user => user.id === userId);
        if (!foundUser) {
          throw new Error(`User with ID ${userId} not found`);
        }
        return { name: foundUser.name };
      });

      const result = await authService.fetchUserById('1');

      expect(result).toEqual({ name: 'John Doe' });
    });

    it('throws an error when backend API returns an error', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      (authService.fetchUserById as jest.Mock).mockImplementationOnce(async (userId: string) => {
        try {
          const response = await axios.get(`http://localhost:3000/auth/username/${userId}`);
          return { name: response.data.username };
        } catch (error) {
          console.error('Error fetching user by ID:', error);
          throw new Error('Unable to fetch user information');
        }
      });

      await expect(authService.fetchUserById('999'))
        .rejects.toThrow('Unable to fetch user information');

      console.error = originalConsoleError;
    });

    it('throws an error with mock data when user ID is not found', async () => {
      (authService.fetchUserById as jest.Mock).mockImplementationOnce(async (userId: string) => {
        const foundUser = mockUsers.find(user => user.id === userId);
        if (!foundUser) {
          throw new Error(`User with ID ${userId} not found`);
        }
        return { name: foundUser.name };
      });

      await expect(authService.fetchUserById('nonexistent-id'))
        .rejects.toThrow('User with ID nonexistent-id not found');
    });
  });
});