export class ExternalServiceError extends Error {
  status: number;

  constructor(message: string = 'External service error') {
    super(message);
    this.status = 502; // Bad Gateway
    this.name = 'ExternalServiceError';
  }
}

export class InternalServerError extends Error {
  status: number;

  constructor(message: string = 'Internal Server Error') {
    super(message);
    this.status = 500; // Internal Server Error
    this.name = 'InternalServerError';
  }
}

export class ResourceAlreadyExistsError extends Error {
  status: number;

  constructor(message: string = 'Resource already exists') {
    super(message);
    this.status = 409; // Conflict
    this.name = 'ResourceAlreadyExistsError';
  }
}

export class ResourceNotFoundError extends Error {
  status: number;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.status = 404; // Not Found
    this.name = 'ResourceNotFoundError';
  }
}

export class ForbiddenError extends Error {
  status: number;

  constructor(message: string = 'Forbidden access') {
    super(message);
    this.status = 403; // Forbidden
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends Error {
  status: number;

  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.status = 401; // Unauthorized
    this.name = 'UnauthorizedError';
  }
}

export class BadRequestError extends Error {
  status: number;

  constructor(message: string = 'Bad request') {
    super(message);
    this.status = 400; // Bad Request
    this.name = 'BadRequestError';
  }
}
