"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDbError = handleDbError;
const client_1 = require("@prisma/client");
const ServiceError_1 = require("../services/ServiceError");
function handleDbError(error) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002": // Unique constraint failed
                const target = error.meta?.target;
                if (target) {
                    if (target.includes("email")) {
                        return ServiceError_1.ServiceError.validationFailed("A user with this email already exists");
                    }
                    if (target.includes("website") && target.includes("userId")) {
                        return ServiceError_1.ServiceError.validationFailed("You already have credentials saved for this website");
                    }
                }
                return ServiceError_1.ServiceError.validationFailed("This record already exists");
            case "P2003": // Foreign key constraint failed
                const fieldName = error.meta?.field_name;
                if (fieldName && fieldName.includes("userId")) {
                    return ServiceError_1.ServiceError.notFound("The specified user does not exist");
                }
                return ServiceError_1.ServiceError.notFound("A related record does not exist");
            case "P2025": // Record not found
                if (error.message.includes("delete")) {
                    return ServiceError_1.ServiceError.notFound("The record you are trying to delete was not found");
                }
                if (error.message.includes("update")) {
                    return ServiceError_1.ServiceError.notFound("The record you are trying to update was not found");
                }
                return ServiceError_1.ServiceError.notFound("Record not found");
            default:
                console.error("Unhandled Prisma error:", error);
                return ServiceError_1.ServiceError.internal("A database error occurred");
        }
    }
    else if (error instanceof ServiceError_1.ServiceError) {
        // If it's already a ServiceError, just return it
        return error;
    }
    else if (error instanceof Error) {
        console.error("Unexpected error:", error);
        return ServiceError_1.ServiceError.internal(error.message || "An unexpected error occurred");
    }
    // Fallback for unknown error types
    console.error("Unknown error:", error);
    return ServiceError_1.ServiceError.internal("An unknown error occurred");
}
