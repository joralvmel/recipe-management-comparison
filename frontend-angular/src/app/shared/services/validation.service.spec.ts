import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co',
        'user-name@domain.com',
        'username123@domain.co.uk',
        'user+name@domain.com',
        'user_name@domain.org'
      ];

      for (const email of validEmails) {
        expect(service.validateEmail(email)).toBeTrue();
      }
    });

    it('should return false for invalid emails', () => {
      const invalidEmails = [
        'plaintext',
        '@nocontent.com',
        'no@domain',
        'no domain@domain.com',
        'user@.com',
        'user@domain.',
        'user@dom@in.com',
        'user@domain.com ',
        ' user@domain.com'
      ];

      for (const email of invalidEmails) {
        expect(service.validateEmail(email)).toBeFalse();
      }
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid passwords', () => {
      const validPasswords = [
        'Password1!',
        'Str0ng@Password',
        'C0mplex.Pass',
        'AnotherP@ss1',
        'ValidP@ssw0rd'
      ];

      for (const password of validPasswords) {
        expect(service.validatePassword(password)).toBeTrue();
      }
    });

    it('should return false for passwords without minimum length', () => {
      expect(service.validatePassword('Pa1@')).toBeFalse();
      expect(service.validatePassword('Aa1.')).toBeFalse();
    });

    it('should return false for passwords without uppercase letters', () => {
      expect(service.validatePassword('password1!')).toBeFalse();
      expect(service.validatePassword('no_uppercase2@')).toBeFalse();
    });

    it('should return false for passwords without lowercase letters', () => {
      expect(service.validatePassword('PASSWORD1!')).toBeFalse();
      expect(service.validatePassword('NO_LOWERCASE2@')).toBeFalse();
    });

    it('should return false for passwords without numbers', () => {
      expect(service.validatePassword('Password!')).toBeFalse();
      expect(service.validatePassword('NoNumbersHere@')).toBeFalse();
    });

    it('should return false for passwords without special characters', () => {
      expect(service.validatePassword('Password123')).toBeFalse();
      expect(service.validatePassword('NoSpecialChars9')).toBeFalse();
    });
  });

  describe('validatePasswordsMatch', () => {
    it('should return true when passwords match', () => {
      expect(service.validatePasswordsMatch('Password123!', 'Password123!')).toBeTrue();
      expect(service.validatePasswordsMatch('', '')).toBeTrue();
    });

    it('should return false when passwords do not match', () => {
      expect(service.validatePasswordsMatch('Password123!', 'password123!')).toBeFalse();
      expect(service.validatePasswordsMatch('Password123!', 'Password124!')).toBeFalse();
      expect(service.validatePasswordsMatch('Password', '')).toBeFalse();
    });
  });

  describe('validateRequired', () => {
    it('should return true for non-empty strings', () => {
      expect(service.validateRequired('Content')).toBeTrue();
      expect(service.validateRequired('A')).toBeTrue();
      expect(service.validateRequired('123')).toBeTrue();
    });

    it('should return false for empty strings', () => {
      expect(service.validateRequired('')).toBeFalse();
    });

    it('should return false for strings with only whitespace', () => {
      expect(service.validateRequired(' ')).toBeFalse();
      expect(service.validateRequired('\t')).toBeFalse();
      expect(service.validateRequired('\n')).toBeFalse();
      expect(service.validateRequired('   ')).toBeFalse();
    });

    it('should return false for null or undefined', () => {
      expect(service.validateRequired(null as unknown as string)).toBeFalse();
      expect(service.validateRequired(undefined as unknown as string)).toBeFalse();
    });
  });
});
