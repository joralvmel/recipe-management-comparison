import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { UserRepository } from '@infrastructure/repositories/userRepository';
import type { User } from '@domain/entities/User';
import type { AuthServicePort } from '@domain/ports/authServicePort';
import {
  InternalServerError,
  ResourceAlreadyExistsError,
  BadRequestError,
  UnauthorizedError, ResourceNotFoundError,
} from '@shared/errors/customErrors';

export class AuthService implements AuthServicePort {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(
    name: string,
    email: string,
    password: string,
  ): Promise<{ id: string; name: string; email: string }> {
    if (!name) {
      throw new BadRequestError('Name is required');
    }
    if (!email) {
      throw new BadRequestError('Email is required');
    }
    if (!password) {
      throw new BadRequestError('Password is required');
    }

    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ResourceAlreadyExistsError('User already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser: User = { name, email, passwordHash };
    const savedUser = await this.userRepository.createUser(newUser);

    if (!savedUser._id) {
      throw new InternalServerError('Failed to save user');
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
      throw new UnauthorizedError('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user._id) {
      throw new InternalServerError('User ID is missing');
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    return { token };
  }

  async getUsernameById(userId: string): Promise<string> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new ResourceNotFoundError('User not found');
    }
    return user.name;
  }
}
