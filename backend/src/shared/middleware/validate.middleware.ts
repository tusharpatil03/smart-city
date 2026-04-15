import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { IssueStatus, VoteType } from "../../modules/issue/issue.types";
import { AppError } from "./error.middleware";

export const validateStatusUpdateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { status } = req.body as Record<string, unknown>;
  const allowedStatuses = Object.values(IssueStatus);

  if (typeof status !== "string" || !allowedStatuses.includes(status as IssueStatus)) {
    next(new AppError(`status must be one of ${allowedStatuses.join(", ")}`, 400));
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

export const validateVoteUpdateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { type } = req.body as Record<string, unknown>;
  const allowedTypes: VoteType[] = ["upvote", "downvote"];

  if (typeof type !== "string" || !allowedTypes.includes(type as VoteType)) {
    next(new AppError(`type must be one of ${allowedTypes.join(", ")}`, 400));
    return;
  }

  next();
};
