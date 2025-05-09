import { TestBed } from '@angular/core/testing';
import { AuthInterceptor } from './auth.interceptor';
import { TokenService } from '@shared/services/token.service';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let httpHandlerSpy: jasmine.SpyObj<HttpHandler>;
  let mockRequest: HttpRequest<unknown>;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.USE_BACKEND;

    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getToken']);
    httpHandlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);

    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: TokenService, useValue: tokenServiceSpy }
      ]
    });

    interceptor = TestBed.inject(AuthInterceptor);

    mockRequest = new HttpRequest('GET', '/api/data');

    httpHandlerSpy.handle.and.returnValue(of({} as HttpEvent<unknown>));
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      process.env.USE_BACKEND = '';
    } else {
      process.env.USE_BACKEND = originalEnv;
    }
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  describe('with backend disabled', () => {
    beforeEach(() => {
      process.env.USE_BACKEND = 'false';
    });

    it('should pass the request unchanged when backend is disabled', () => {
      tokenServiceSpy.getToken.and.returnValue('test-token');

      interceptor.intercept(mockRequest, httpHandlerSpy);

      expect(httpHandlerSpy.handle).toHaveBeenCalledWith(mockRequest);
      expect(tokenServiceSpy.getToken).not.toHaveBeenCalled();
    });
  });

  describe('with backend enabled', () => {
    beforeEach(() => {
      process.env.USE_BACKEND = 'true';
    });

    it('should add authorization header when token exists', () => {
      const token = 'test-token';
      tokenServiceSpy.getToken.and.returnValue(token);

      interceptor.intercept(mockRequest, httpHandlerSpy);

      expect(tokenServiceSpy.getToken).toHaveBeenCalled();
      expect(httpHandlerSpy.handle).toHaveBeenCalled();

      const modifiedRequest = httpHandlerSpy.handle.calls.first().args[0] as HttpRequest<unknown>;
      expect(modifiedRequest).not.toBe(mockRequest);
      expect(modifiedRequest.headers.has('Authorization')).toBeTrue();
      expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('should pass the request unchanged when no token exists', () => {
      tokenServiceSpy.getToken.and.returnValue(null);

      interceptor.intercept(mockRequest, httpHandlerSpy);

      expect(tokenServiceSpy.getToken).toHaveBeenCalled();
      expect(httpHandlerSpy.handle).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('with request methods', () => {
    beforeEach(() => {
      process.env.USE_BACKEND = 'true';
      tokenServiceSpy.getToken.and.returnValue('test-token');
    });

    it('should handle GET requests', () => {
      const getRequest = new HttpRequest('GET', '/api/data');
      interceptor.intercept(getRequest, httpHandlerSpy);

      const modifiedRequest = httpHandlerSpy.handle.calls.first().args[0] as HttpRequest<unknown>;
      expect(modifiedRequest.method).toBe('GET');
      expect(modifiedRequest.headers.has('Authorization')).toBeTrue();
    });

    it('should handle POST requests', () => {
      const postRequest = new HttpRequest('POST', '/api/data', { test: 'data' });
      interceptor.intercept(postRequest, httpHandlerSpy);

      const modifiedRequest = httpHandlerSpy.handle.calls.first().args[0] as HttpRequest<unknown>;
      expect(modifiedRequest.method).toBe('POST');
      expect(modifiedRequest.headers.has('Authorization')).toBeTrue();
    });

    it('should maintain request body and other properties', () => {
      const requestBody = { test: 'data' };
      const postRequest = new HttpRequest('POST', '/api/data', requestBody);

      interceptor.intercept(postRequest, httpHandlerSpy);

      const modifiedRequest = httpHandlerSpy.handle.calls.first().args[0] as HttpRequest<unknown>;
      expect(modifiedRequest.body).toEqual(requestBody);
    });
  });

  describe('with different URLs', () => {
    beforeEach(() => {
      process.env.USE_BACKEND = 'true';
      tokenServiceSpy.getToken.and.returnValue('test-token');
    });

    it('should add token to API requests', () => {
      const apiRequest = new HttpRequest('GET', 'https://api.example.com/data');
      interceptor.intercept(apiRequest, httpHandlerSpy);

      const modifiedRequest = httpHandlerSpy.handle.calls.first().args[0] as HttpRequest<unknown>;
      expect(modifiedRequest.headers.has('Authorization')).toBeTrue();
    });

    it('should add token to relative URL requests', () => {
      const relativeRequest = new HttpRequest('GET', '/api/data');
      interceptor.intercept(relativeRequest, httpHandlerSpy);

      const modifiedRequest = httpHandlerSpy.handle.calls.first().args[0] as HttpRequest<unknown>;
      expect(modifiedRequest.headers.has('Authorization')).toBeTrue();
    });
  });
});
