// src/services/ServiceError.ts
export enum ServiceErrorCode {
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL = "INTERNAL",
}

export class ServiceError extends Error {
  public code: ServiceErrorCode;
  public details: unknown;

  constructor(code: ServiceErrorCode, message: string, details: unknown = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "ServiceError";
  }

  static notFound(message: string, details?: unknown) {
    return new ServiceError(ServiceErrorCode.NOT_FOUND, message, details);
  }

  static validationFailed(message: string, details?: unknown) {
    return new ServiceError(
      ServiceErrorCode.VALIDATION_FAILED,
      message,
      details
    );
  }

  static unauthorized(message: string, details?: unknown) {
    return new ServiceError(ServiceErrorCode.UNAUTHORIZED, message, details);
  }

  static forbidden(message: string, details?: unknown) {
    return new ServiceError(ServiceErrorCode.FORBIDDEN, message, details);
  }

  static internal(message: string, details?: unknown) {
    return new ServiceError(ServiceErrorCode.INTERNAL, message, details);
  }

  get isNotFound(): boolean {
    return this.code === ServiceErrorCode.NOT_FOUND;
  }

  get isValidationFailed(): boolean {
    return this.code === ServiceErrorCode.VALIDATION_FAILED;
  }

  get isUnauthorized(): boolean {
    return this.code === ServiceErrorCode.UNAUTHORIZED;
  }

  get isForbidden(): boolean {
    return this.code === ServiceErrorCode.FORBIDDEN;
  }

  get isInternal(): boolean {
    return this.code === ServiceErrorCode.INTERNAL;
  }
}
