import axios, { AxiosError } from 'axios';
import { userData, type User } from '../data/userData';

const API_URL = 'http://localhost:3000/auth';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

const useBackend = import.meta.env.VITE_USE_BACKEND === 'true';

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
      password: "mocked_hashed_password",
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