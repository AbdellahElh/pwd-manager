"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceError = exports.ServiceErrorCode = void 0;
// src/services/ServiceError.ts
var ServiceErrorCode;
(function (ServiceErrorCode) {
    ServiceErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ServiceErrorCode["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    ServiceErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ServiceErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ServiceErrorCode["INTERNAL"] = "INTERNAL";
})(ServiceErrorCode || (exports.ServiceErrorCode = ServiceErrorCode = {}));
class ServiceError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "ServiceError";
    }
    static notFound(message, details) {
        return new ServiceError(ServiceErrorCode.NOT_FOUND, message, details);
    }
    static validationFailed(message, details) {
        return new ServiceError(ServiceErrorCode.VALIDATION_FAILED, message, details);
    }
    static unauthorized(message, details) {
        return new ServiceError(ServiceErrorCode.UNAUTHORIZED, message, details);
    }
    static forbidden(message, details) {
        return new ServiceError(ServiceErrorCode.FORBIDDEN, message, details);
    }
    static internal(message, details) {
        return new ServiceError(ServiceErrorCode.INTERNAL, message, details);
    }
    get isNotFound() {
        return this.code === ServiceErrorCode.NOT_FOUND;
    }
    get isValidationFailed() {
        return this.code === ServiceErrorCode.VALIDATION_FAILED;
    }
    get isUnauthorized() {
        return this.code === ServiceErrorCode.UNAUTHORIZED;
    }
    get isForbidden() {
        return this.code === ServiceErrorCode.FORBIDDEN;
    }
    get isInternal() {
        return this.code === ServiceErrorCode.INTERNAL;
    }
}
exports.ServiceError = ServiceError;
