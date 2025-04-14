import { BadRequestError } from '@shared/errors/customErrors';
import type { AuthServicePort } from '@domain/ports/authServicePort';

export class getUsernameById {
  constructor(private authService: AuthServicePort) {}

  async execute(userId: string): Promise<{ username: string }> {
    if (!/^[a-f\d]{24}$/i.test(userId)) {
      throw new BadRequestError('Invalid user ID');
    }
    const username = await this.authService.getUsernameById(userId);
    return { username };
  }
}
