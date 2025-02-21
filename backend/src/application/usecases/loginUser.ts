import { AuthServicePort } from '@domain/ports/authServicePort';

export class LoginUser {
  constructor(private authService: AuthServicePort) {}

  async execute(email: string, password: string): Promise<{ token: string }> {
    return this.authService.loginUser(email, password);
  }
}
