import { User } from '@domain/entities/User';

export interface UserRepositoryPort {
  findUserByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<User>;
}
