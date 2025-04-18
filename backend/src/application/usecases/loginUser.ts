import type { AuthServicePort } from '@domain/ports/authServicePort';

export class loginUser {
  constructor(private authService: AuthServicePort) {}

  async execute(email: string, password: string): Promise<{ token: string }> {
    return this.authService.loginUser(email, password);
  }
}
