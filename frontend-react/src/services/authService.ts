import { userData } from '../data/userData';
import type { User } from '../types';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:3000/auth';

export interface LoginResponse {
  token?: string;
  user?: User;
}

export interface RegisterResponse {
  message: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';

export const loginUser = async (email: string, password: string): Promise<LoginResponse | null> => {
  if (!useBackend) {
    const foundUser = userData.find((user: User) => user.email === email);

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    if (foundUser.password !== password) {
      throw new Error('Invalid credentials');
    }

    return { user: foundUser };
  }

  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });

    if (response.data.token) {
      const decodedUser = jwtDecode<User>(response.data.token);
      return { user: decodedUser };
    }

    return null;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const backendError = error.response.data?.error || 'An unexpected error occurred';
      throw new Error(backendError);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const registerUser = async (registerData: RegisterUserData): Promise<RegisterResponse> => {
  if (!useBackend) {
    const existingUser = userData.find((user: User) => user.email === registerData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      createdAt: Date.now(),
    };

    userData.push(newUser);

    return { message: 'Mocked: Registration successful' };
  }

  try {
    const response = await axios.post<RegisterResponse>(`${API_URL}/register`, registerData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const backendError = error.response.data?.error || 'An unexpected error occurred';
      throw new Error(backendError);
    }
    throw new Error('An unexpected error occurred');
  }
};
