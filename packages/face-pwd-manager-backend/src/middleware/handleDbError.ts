import { Prisma } from "@prisma/client";
import { ServiceError } from "../services/ServiceError";

export function handleDbError(error: unknown): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // Unique constraint failed
        const target = error.meta?.target as string[] | undefined;
        if (target) {
          if (target.includes("email")) {
            return ServiceError.validationFailed(
              "A user with this email already exists"
            );
          }
          if (target.includes("website") && target.includes("userId")) {
            return ServiceError.validationFailed(
              "You already have credentials saved for this website"
            );
          }
        }
        return ServiceError.validationFailed("This record already exists");

      case "P2003": // Foreign key constraint failed
        const fieldName = error.meta?.field_name as string | undefined;
        if (fieldName && fieldName.includes("userId")) {
          return ServiceError.notFound("The specified user does not exist");
        }
        return ServiceError.notFound("A related record does not exist");

      case "P2025": // Record not found
        if (error.message.includes("delete")) {
          return ServiceError.notFound(
            "The record you are trying to delete was not found"
          );
        }
        if (error.message.includes("update")) {
          return ServiceError.notFound(
            "The record you are trying to update was not found"
          );
        }
        return ServiceError.notFound("Record not found");

      default:
        console.error("Unhandled Prisma error:", error);
        return ServiceError.internal("A database error occurred");
    }
  } else if (error instanceof ServiceError) {
    // If it's already a ServiceError, just return it
    return error;
  } else if (error instanceof Error) {
    console.error("Unexpected error:", error);
    return ServiceError.internal(
      error.message || "An unexpected error occurred"
    );
  }

  // Fallback for unknown error types
  console.error("Unknown error:", error);
  return ServiceError.internal("An unknown error occurred");
}
