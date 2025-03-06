export class ExternalServiceError extends Error {
  status: number;

  constructor(message = 'External service error') {
    super(message);
    this.status = 502; // Bad Gateway
    this.name = 'ExternalServiceError';
  }
}

export class InternalServerError extends Error {
  status: number;

  constructor(message = 'Internal Server Error') {
    super(message);
    this.status = 500; // Internal Server Error
    this.name = 'InternalServerError';
  }
}

export class ResourceAlreadyExistsError extends Error {
  status: number;

  constructor(message = 'Resource already exists') {
    super(message);
    this.status = 409; // Conflict
    this.name = 'ResourceAlreadyExistsError';
  }
}

export class ResourceNotFoundError extends Error {
  status: number;

  constructor(message = 'Resource not found') {
    super(message);
    this.status = 404; // Not Found
    this.name = 'ResourceNotFoundError';
  }
}

export class ForbiddenError extends Error {
  status: number;

  constructor(message = 'Forbidden access') {
    super(message);
    this.status = 403; // Forbidden
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends Error {
  status: number;

  constructor(message = 'Unauthorized access') {
    super(message);
    this.status = 401; // Unauthorized
    this.name = 'UnauthorizedError';
  }
}

export class BadRequestError extends Error {
  status: number;

  constructor(message = 'Bad request') {
    super(message);
    this.status = 400; // Bad Request
    this.name = 'BadRequestError';
  }
}

export interface CustomError extends Error {
  status?: number;
  response?: {
    status: number;
    statusText: string;
  };
}
