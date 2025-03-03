import { RegisterUser } from '@application/usecases/registerUser';
import { AuthServicePort } from '@domain/ports/authServicePort';

describe('RegisterUser', () => {
    let authServiceMock: jest.Mocked<AuthServicePort>;
    let useCase: RegisterUser;

    beforeEach(() => {
        authServiceMock = {
            registerUser: jest.fn(),
            loginUser: jest.fn(),
        } as jest.Mocked<AuthServicePort>;

        useCase = new RegisterUser(authServiceMock);
    });

    it('should call registerUser on the authService with correct parameters', async () => {
        const name = 'John Doe';
        const email = 'john.doe@example.com';
        const password = 'password123';

        await useCase.execute(name, email, password);

        expect(authServiceMock.registerUser).toHaveBeenCalledWith(name, email, password);
    });

    it('should return the result from authService.registerUser', async () => {
        const name = 'John Doe';
        const email = 'john.doe@example.com';
        const password = 'password123';
        const expectedResult = { id: 'user123', name, email };

        authServiceMock.registerUser.mockResolvedValue(expectedResult);

        const result = await useCase.execute(name, email, password);

        expect(result).toEqual(expectedResult);
    });
});
