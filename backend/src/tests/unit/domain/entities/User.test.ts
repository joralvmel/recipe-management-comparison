import { User } from '@domain/entities/User';
import { ObjectId } from 'mongodb';

describe('User', () => {
  it('should create a User instance with the given parameters', () => {
    const name = 'John Doe';
    const email = 'john.doe@example.com';
    const passwordHash = 'hashedpassword';
    const createdAt = new Date();
    const _id = new ObjectId();

    const user = new User(name, email, passwordHash, createdAt);
    user._id = _id;

    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
    expect(user.passwordHash).toBe(passwordHash);
    expect(user.createdAt).toBe(createdAt);
    expect(user._id).toBe(_id);
  });

  it('should create a User instance without optional parameters', () => {
    const name = 'Jane Doe';
    const email = 'jane.doe@example.com';
    const passwordHash = 'hashedpassword';

    const user = new User(name, email, passwordHash);

    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
    expect(user.passwordHash).toBe(passwordHash);
    expect(user.createdAt).toBeUndefined();
    expect(user._id).toBeUndefined();
  });
});
