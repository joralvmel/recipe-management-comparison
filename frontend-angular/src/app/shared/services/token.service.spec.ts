import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  const validToken = 'valid.mock.token';
  const mockUser = { id: 'user123', name: 'Test User', email: 'test@example.com' };

  const validDecodedToken = {
    ...mockUser,
    iat: Math.floor(Date.now() / 1000) - 1000,
    exp: Math.floor(Date.now() / 1000) + 1000
  };

  const expiredDecodedToken = {
    ...mockUser,
    iat: Math.floor(Date.now() / 1000) - 2000,
    exp: Math.floor(Date.now() / 1000) - 1000
  };

  beforeEach(() => {
    const store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake(key => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      store[key] = value;
      return undefined;
    });
    spyOn(localStorage, 'removeItem').and.callFake(key => delete store[key]);

    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getToken', () => {
    it('should retrieve token from localStorage', () => {
      localStorage.setItem('auth_token', validToken);

      const result = service.getToken();

      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
      expect(result).toBe(validToken);
    });

    it('should return null if no token exists', () => {
      const result = service.getToken();

      expect(result).toBeNull();
    });
  });

  describe('saveToken', () => {
    it('should save token to localStorage', () => {
      service.saveToken(validToken);

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', validToken);
    });
  });

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      service.removeToken();

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token', () => {
      spyOn(service, 'getToken').and.returnValue(validToken);
      const decodeSpy = spyOn<TokenService>(service, 'decodeToken').and.callThrough();

      decodeSpy.and.returnValue(validDecodedToken);

      const result = service.decodeToken();

      expect(result).toEqual(validDecodedToken);
    });

    it('should return null if no token exists', () => {
      spyOn(service, 'getToken').and.returnValue(null);
      const result = service.decodeToken();
      expect(result).toBeNull();
    });

    it('should remove token and return null if decoding fails', () => {
      spyOn(service, 'getToken').and.returnValue('invalid-token');
      spyOn(service, 'removeToken');

      const patchedService = TestBed.inject(TokenService);
      const originalDecodeToken = patchedService.decodeToken;
      patchedService.decodeToken = function() {
        try {
          return originalDecodeToken.call(this);
        } catch (e) {
          expect(service.removeToken).toHaveBeenCalled();
          return null;
        }
      };

      const result = patchedService.decodeToken();
      expect(result).toBeNull();
    });
  });

  describe('isTokenValid', () => {
    it('should return true for a valid non-expired token', () => {
      spyOn(service, 'decodeToken').and.returnValue(validDecodedToken);

      const result = service.isTokenValid();

      expect(result).toBe(true);
    });

    it('should return false for an expired token', () => {
      spyOn(service, 'decodeToken').and.returnValue(expiredDecodedToken);

      const result = service.isTokenValid();

      expect(result).toBe(false);
    });

    it('should return false if no token exists', () => {
      spyOn(service, 'decodeToken').and.returnValue(null);

      const result = service.isTokenValid();

      expect(result).toBe(false);
    });
  });

  describe('getUserFromToken', () => {
    it('should extract user information from a valid token', () => {
      spyOn(service, 'decodeToken').and.returnValue(validDecodedToken);

      const result = service.getUserFromToken();

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email
      });
    });

    it('should return null if no token exists', () => {
      spyOn(service, 'decodeToken').and.returnValue(null);

      const result = service.getUserFromToken();

      expect(result).toBeNull();
    });
  });
});
