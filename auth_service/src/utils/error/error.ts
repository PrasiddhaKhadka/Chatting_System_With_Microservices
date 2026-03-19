export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly meta?: Record<string, unknown>| undefined;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    meta?: Record<string, unknown>,
    isOperational = true         
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational; 
    this.meta = meta;

    Error.captureStackTrace(this, this.constructor);
  }
}


// ─── HTTP-mapped error subclasses ──────────────────────────────────────────
export class BadRequestError extends AppError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 400, "BAD_REQUEST", meta);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 409, "CONFLICT", meta);
  }
}

export class ValidationError extends AppError {
  public readonly errors: { field: string; message: string }[];

  constructor(errors: { field: string; message: string }[]) {
    super("Validation failed", 422, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}

export class InternalServerError extends AppError {
  constructor(message = "An unexpected error occurred") {
    super(message, 500, "INTERNAL_SERVER_ERROR", undefined, false); 
  }
}


