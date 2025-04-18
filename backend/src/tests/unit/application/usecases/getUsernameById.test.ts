import { getUsernameById } from '@application/usecases/getUsernameById';
import type { AuthServicePort } from '@domain/ports/authServicePort';
import { BadRequestError } from '@shared/errors/customErrors';

describe('GetUsernameById', () => {
  let authServiceMock: jest.Mocked<AuthServicePort>;
  let useCase: getUsernameById;

  beforeEach(() => {
    authServiceMock = {
      loginUser: jest.fn(),
      registerUser: jest.fn(),
      getUsernameById: jest.fn(),
    } as jest.Mocked<AuthServicePort>;

    useCase = new getUsernameById(authServiceMock);
  });

  it('should call getUsernameById on the authService with the correct userId', async () => {
    const userId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

    await useCase.execute(userId);

    expect(authServiceMock.getUsernameById).toHaveBeenCalledWith(userId);
  });

  it('should return the username from authService.getUsernameById', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const expectedResult = { username: 'Test User' };

    authServiceMock.getUsernameById.mockResolvedValue('Test User');

    const result = await useCase.execute(userId);

    expect(result).toEqual(expectedResult);
  });

  it('should throw an error if authService.getUsernameById throws an error', async () => {
    const userId = '507f1f77bcf86cd799439011';

    authServiceMock.getUsernameById.mockRejectedValue(new Error('User not found'));

    await expect(useCase.execute(userId)).rejects.toThrow('User not found');
  });

  it('should throw a BadRequestError if the userId format is invalid', async () => {
    const invalidUserId = 'invalidUserId';

    await expect(useCase.execute(invalidUserId)).rejects.toThrow(BadRequestError);

    await expect(useCase.execute(invalidUserId)).rejects.toThrow('Invalid user ID');
  });

  it('should not call authService.getUsernameById if userId format is invalid', async () => {
    const invalidUserId = 'invalidUserId';

    await expect(useCase.execute(invalidUserId)).rejects.toThrow(BadRequestError);

    expect(authServiceMock.getUsernameById).not.toHaveBeenCalled();
  });
});