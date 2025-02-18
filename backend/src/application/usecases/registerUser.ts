import { AuthServicePort } from '@domain/ports/authServicePort';

export class RegisterUser {
  constructor(private authService: AuthServicePort) {}

  async execute(name: string, email: string, password: string): Promise<{ id: string; name: string; email: string }> {
    return this.authService.registerUser(name, email, password);
  }
}
