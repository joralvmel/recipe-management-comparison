import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@infrastructure/repositories/userRepository';
import { User } from '@domain/entities/User';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async registerUser(
    name: string,
    email: string,
    password: string,
  ): Promise<{ id: string; name: string; email: string }> {
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser: User = { name, email, passwordHash };
    const savedUser = await this.userRepository.createUser(newUser);

    if (!savedUser._id) {
      throw new Error('Failed to save user');
    }

    return {
      id: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email,
    };
  }

  async loginUser(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user._id!.toString(), email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' },
    );
    return { token };
  }
}
