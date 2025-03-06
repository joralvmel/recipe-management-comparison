import { LoginUser } from '@application/usecases/loginUser';
import type { AuthServicePort } from '@domain/ports/authServicePort';

describe('LoginUser', () => {
    let authServiceMock: jest.Mocked<AuthServicePort>;
    let useCase: LoginUser;

    beforeEach(() => {
        authServiceMock = {
            loginUser: jest.fn(),
            registerUser: jest.fn(),
        } as jest.Mocked<AuthServicePort>;

        useCase = new LoginUser(authServiceMock);
    });

    it('should call loginUser on the authService with correct parameters', async () => {
        const email = 'test@example.com';
        const password = 'password123';

        await useCase.execute(email, password);

        expect(authServiceMock.loginUser).toHaveBeenCalledWith(email, password);
    });

    it('should return the result from authService.loginUser', async () => {
        const email = 'test@example.com';
        const password = 'password123';
        const expectedResult = { token: 'test-token' };

        authServiceMock.loginUser.mockResolvedValue(expectedResult);

        const result = await useCase.execute(email, password);

        expect(result).toEqual(expectedResult);
    });
});
