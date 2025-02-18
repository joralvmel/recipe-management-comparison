import { AuthService } from '@application/services/authService';

const authService = new AuthService();

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Missing required fields');
  }
  return await authService.loginUser(email, password);
};
