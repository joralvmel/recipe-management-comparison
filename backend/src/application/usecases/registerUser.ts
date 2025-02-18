import { AuthService } from '@application/services/authService';

const authService = new AuthService();

export const registerUser = async (name: string, email: string, password: string) => {
  if (!name || !email || !password) {
    throw new Error('Missing required fields');
  }
  return await authService.registerUser(name, email, password);
};
