export interface AuthServicePort {
  registerUser(name: string, email: string, password: string): Promise<{ id: string; name: string; email: string }>;
  loginUser(email: string, password: string): Promise<{ token: string }>;
}
