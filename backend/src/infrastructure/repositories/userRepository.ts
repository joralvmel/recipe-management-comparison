import { UserRepositoryPort } from '@domain/ports/userRepositoryPort';
import { UserModel } from './userSchema';
import { User } from '@domain/entities/User';

export class UserRepository implements UserRepositoryPort {
  async createUser(user: User): Promise<User> {
    const newUser = new UserModel(user);
    await newUser.save();
    return newUser.toObject();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email }).lean().exec();
  }
}
