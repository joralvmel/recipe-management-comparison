import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.API_URL;
    process.env.API_URL = 'https://api.test';

    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();

    if (originalEnv === undefined) {
      process.env.API_URL = '';
    } else {
      process.env.API_URL = originalEnv;
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST request with correct email and password', () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockResponse = { token: 'mock-jwt-token' };

      service.login(mockEmail, mockPassword).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: mockEmail,
        password: mockPassword
      });

      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should send POST request with correct user details', () => {
      const mockName = 'Test User';
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockResponse = {
        id: '123',
        name: mockName,
        email: mockEmail
      };

      service.register(mockName, mockEmail, mockPassword).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: mockName,
        email: mockEmail,
        password: mockPassword
      });

      req.flush(mockResponse);
    });
  });

  describe('getUsernameById', () => {
    it('should send GET request with correct user ID', () => {
      const mockUserId = '123';
      const mockResponse = { username: 'testuser' };

      service.getUsernameById(mockUserId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${process.env.API_URL}/auth/username/${mockUserId}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);
    });
  });
});
