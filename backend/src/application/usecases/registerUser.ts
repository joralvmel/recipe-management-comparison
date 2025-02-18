import { AuthServicePort } from '@domain/ports/authServicePort';
import { UserRepositoryPort } from '@domain/ports/userRepositoryPort';
import { User } from '@domain/entities/User';

export class RegisterUser {
  constructor(
    private authService: AuthServicePort,
    private userRepository: UserRepositoryPort,
  ) {}

  async execute(name: string, email: string, password: string): Promise<{ id: string; name: string; email: string }> {
    const user = new User(name, email, password);
    await this.userRepository.createUser(user);
    return this.authService.registerUser(name, email, password);
  }
}