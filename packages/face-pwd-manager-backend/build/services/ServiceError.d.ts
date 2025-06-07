export declare enum ServiceErrorCode {
    NOT_FOUND = "NOT_FOUND",
    VALIDATION_FAILED = "VALIDATION_FAILED",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    INTERNAL = "INTERNAL"
}
export declare class ServiceError extends Error {
    code: ServiceErrorCode;
    details: unknown;
    constructor(code: ServiceErrorCode, message: string, details?: unknown);
    static notFound(message: string, details?: unknown): ServiceError;
    static validationFailed(message: string, details?: unknown): ServiceError;
    static unauthorized(message: string, details?: unknown): ServiceError;
    static forbidden(message: string, details?: unknown): ServiceError;
    static internal(message: string, details?: unknown): ServiceError;
    get isNotFound(): boolean;
    get isValidationFailed(): boolean;
    get isUnauthorized(): boolean;
    get isForbidden(): boolean;
    get isInternal(): boolean;
}
//# sourceMappingURL=ServiceError.d.ts.map