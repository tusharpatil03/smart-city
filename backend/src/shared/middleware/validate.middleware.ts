import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { IssueStatus } from "../../modules/issue/issue.types";
import { AppError } from "./error.middleware";

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const parseNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return Number(value);
  }

  return Number.NaN;
};

export const validateCreateIssueRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { title, latitude, longitude } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(title)) {
    next(new AppError("title is required", 400));
    return;
  }

  const lat = parseNumber(latitude);
  const lng = parseNumber(longitude);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    next(new AppError("latitude must be a valid number between -90 and 90", 400));
    return;
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    next(new AppError("longitude must be a valid number between -180 and 180", 400));
    return;
  }

  next();
};

export const validateStatusUpdateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { status } = req.body as Record<string, unknown>;

  if (typeof status !== "string" || !(status in IssueStatus)) {
    next(new AppError("status must be one of OPEN, IN_PROGRESS, RESOLVED", 400));
    return;
  }

  next();
};

export const validateIssueIdParam = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    next(new AppError("Invalid issue id", 400));
    return;
  }

  next();
};
