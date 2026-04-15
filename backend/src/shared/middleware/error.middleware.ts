import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string | undefined;
  public readonly details: unknown;

  constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isReferenceEndpoint =
    req.path === "/api/report" ||
    req.path === "/api/reports" ||
    req.path === "/api/healthz";

  const sendReferenceError = (statusCode: number, message: string): void => {
    res.status(statusCode).json({
      error: message
    });
  };

  if (err instanceof AppError) {
    if (isReferenceEndpoint) {
      sendReferenceError(err.statusCode, err.message);
      return;
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.code ? { code: err.code } : {}),
        ...(err.details !== undefined ? { details: err.details } : {})
      }
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    if (isReferenceEndpoint) {
      sendReferenceError(400, `Invalid ${err.path}`);
      return;
    }

    res.status(400).json({
      success: false,
      error: {
        message: `Invalid ${err.path}`,
        code: "CAST_ERROR"
      }
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    if (isReferenceEndpoint) {
      sendReferenceError(400, err.message);
      return;
    }

    res.status(400).json({
      success: false,
      error: {
        message: err.message,
        code: "VALIDATION_ERROR"
      }
    });
    return;
  }

  // Duplicate key errors are surfaced from MongoDB driver at runtime.
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === 11000
  ) {
    if (isReferenceEndpoint) {
      sendReferenceError(409, "Duplicate key error");
      return;
    }

    res.status(409).json({
      success: false,
      error: {
        message: "Duplicate key error",
        code: "DUPLICATE_KEY"
      }
    });
    return;
  }

  if (err instanceof Error) {
    if (isReferenceEndpoint) {
      sendReferenceError(500, err.message);
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: err.message,
        code: "INTERNAL_ERROR"
      }
    });
    return;
  }

  if (isReferenceEndpoint) {
    sendReferenceError(500, "Internal Server Error");
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: "Internal Server Error",
      code: "INTERNAL_ERROR"
    }
  });
};
