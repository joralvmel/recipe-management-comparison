import { UserRepository } from '@infrastructure/repositories/userRepository';
import { UserModel } from '@infrastructure/repositories/userSchema';
import { User } from '@domain/entities/User';

jest.mock('@infrastructure/repositories/userSchema');

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user and return the created user', async () => {
      const user: User = { email: 'test@example.com', name: 'Test User', passwordHash: 'hashedPassword' };
      const savedUser = { ...user, _id: '1' };
      (UserModel.prototype.save as jest.Mock).mockResolvedValue(savedUser);
      (UserModel.prototype.toObject as jest.Mock).mockReturnValue(savedUser);

      const result = await userRepository.createUser(user);

      expect(UserModel).toHaveBeenCalledWith(user);
      expect(result).toEqual(savedUser);
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email and return the user', async () => {
      const email = 'test@example.com';
      const user: User = { _id: '1', email, name: 'Test User', passwordHash: 'hashedPassword' };
      (UserModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await userRepository.findUserByEmail(email);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(user);
    });
  });
});
