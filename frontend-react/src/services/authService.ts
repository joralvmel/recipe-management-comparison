import type { UserType } from '../types';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { userData } from '../data/userData';

const API_URL = 'http://localhost:3000/auth';
const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';

interface LoginResponse {
  token?: string;
  user?: UserType;
}

interface RegisterResponse {
  message: string;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse | null> => {
  if (!useBackend) {
    const foundUser = userData.find((user: UserType) => user.email === email);

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
      const decodedUser = jwtDecode<UserType>(response.data.token);
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

export const registerUser = async (registerData: UserType): Promise<RegisterResponse> => {
  if (!useBackend) {
    const existingUser = userData.find((user: UserType) => user.email === registerData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: UserType = {
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
