"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const ServiceError_1 = require("../services/ServiceError");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ServiceError_1.ServiceError) {
        let status;
        switch (err.code) {
            case ServiceError_1.ServiceErrorCode.NOT_FOUND:
                status = 404;
                break;
            case ServiceError_1.ServiceErrorCode.VALIDATION_FAILED:
                status = 400;
                break;
            case ServiceError_1.ServiceErrorCode.UNAUTHORIZED:
                status = 401;
                break;
            case ServiceError_1.ServiceErrorCode.FORBIDDEN:
                status = 403;
                break;
            case ServiceError_1.ServiceErrorCode.INTERNAL:
                status = 500;
                break;
            default:
                status = 500;
        }
        res.status(status).json({ error: err.message, details: err.details });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: "Validation error",
            issues: err.errors,
        });
        return;
    }
    console.error(err);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
    });
    return;
};
exports.errorHandler = errorHandler;
