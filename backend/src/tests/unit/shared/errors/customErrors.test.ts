import {
  ExternalServiceError,
  InternalServerError,
  ResourceAlreadyExistsError,
  ResourceNotFoundError,
  ForbiddenError,
  UnauthorizedError,
  BadRequestError,
} from '@shared/errors/customErrors';

describe('Custom Error Classes', () => {
  it('should create an ExternalServiceError with correct properties', () => {
    const error = new ExternalServiceError();
    expect(error.status).toBe(502);
    expect(error.message).toBe('External service error');
    expect(error.name).toBe('ExternalServiceError');
  });

  it('should create an InternalServerError with correct properties', () => {
    const error = new InternalServerError();
    expect(error.status).toBe(500);
    expect(error.message).toBe('Internal Server Error');
    expect(error.name).toBe('InternalServerError');
  });

  it('should create a ResourceAlreadyExistsError with correct properties', () => {
    const error = new ResourceAlreadyExistsError();
    expect(error.status).toBe(409);
    expect(error.message).toBe('Resource already exists');
    expect(error.name).toBe('ResourceAlreadyExistsError');
  });

  it('should create a ResourceNotFoundError with correct properties', () => {
    const error = new ResourceNotFoundError();
    expect(error.status).toBe(404);
    expect(error.message).toBe('Resource not found');
    expect(error.name).toBe('ResourceNotFoundError');
  });

  it('should create a ForbiddenError with correct properties', () => {
    const error = new ForbiddenError();
    expect(error.status).toBe(403);
    expect(error.message).toBe('Forbidden access');
    expect(error.name).toBe('ForbiddenError');
  });

  it('should create an UnauthorizedError with correct properties', () => {
    const error = new UnauthorizedError();
    expect(error.status).toBe(401);
    expect(error.message).toBe('Unauthorized access');
    expect(error.name).toBe('UnauthorizedError');
  });

  it('should create a BadRequestError with correct properties', () => {
    const error = new BadRequestError();
    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error.name).toBe('BadRequestError');
  });
});
