// src/middleware/errorHandler.ts
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

import { ZodError } from "zod";
import { ServiceError, ServiceErrorCode } from "../services/ServiceError";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ServiceError) {
    let status: number;
    switch (err.code) {
      case ServiceErrorCode.NOT_FOUND:
        status = 404;
        break;
      case ServiceErrorCode.VALIDATION_FAILED:
        status = 400;
        break;
      case ServiceErrorCode.UNAUTHORIZED:
        status = 401;
        break;
      case ServiceErrorCode.FORBIDDEN:
        status = 403;
        break;
      case ServiceErrorCode.INTERNAL:
        status = 500;
        break;
      default:
        status = 500;
    }
    res.status(status).json({ error: err.message, details: err.details });
    return;
  }

  if (err instanceof ZodError) {
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
