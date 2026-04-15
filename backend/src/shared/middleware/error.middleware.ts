import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      error: `Invalid ${err.path}`
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      error: err.message
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
    res.status(409).json({
      error: "Duplicate key error"
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      error: err.message
    });
    return;
  }

  res.status(500).json({
    error: "Internal Server Error"
  });
};
