import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authService } from "../../modules/auth/auth.service";
import { AuthenticatedAuthority } from "../../modules/auth/auth.types";
import { env } from "../config/env";
import { AppError } from "./error.middleware";

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedAuthority;
};

export const protectAuthority = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorization = req.header("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new AppError("Authorization token is required", 401);
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      throw new AppError("Authorization token is required", 401);
    }

    const payload = jwt.verify(token, env.jwtSecret) as { id?: string; role?: string };

    if (!payload.id || payload.role !== "authority") {
      throw new AppError("Invalid authorization token", 401);
    }

    const user = await authService.getAuthorityById(payload.id);
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Invalid authorization token", 401));
  }
};
