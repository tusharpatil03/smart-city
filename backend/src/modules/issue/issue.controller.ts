import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authService } from "../auth/auth.service";
import type { AuthenticatedAuthority } from "../auth/auth.types";
import { env } from "../../shared/config/env";
import { resendService } from "../../shared/integrations/resend.service";
import { AppError } from "../../shared/middleware/error.middleware";
import { parseGeoFilter } from "../../shared/utils/geo.utils";
import { issueService } from "./issue.service";
import { toReportListResponse, toReportResponse } from "./issue.serializer";
import { IssueStatus, VoteType } from "./issue.types";
import { validateCreateReportInput } from "./issue.validator";

interface AuthenticatedRequestUser {
  id?: string;
  _id?: string;
  email?: string;
  name?: string;
}

type AuthenticatedRequest = Request & {
  user?: AuthenticatedRequestUser;
};

const getCurrentUserId = (req: Request): string | undefined => {
  const user = (req as AuthenticatedRequest).user;
  const headerUserId = req.header("x-user-id") ?? undefined;
  return user?.id ?? user?._id ?? headerUserId;
};

const getVoteActorId = (req: Request): string => {
  return req.header("x-user-id")?.trim() || "anonymous-browser";
};

const getAuthorizationToken = (req: Request): string | undefined => {
  const authorization = req.header("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return undefined;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || undefined;
};

const getAuthenticatedAuthority = async (
  req: Request
): Promise<AuthenticatedAuthority | undefined> => {
  const userFromRequest = (req as AuthenticatedRequest).user;

  if (userFromRequest?.id && userFromRequest.email) {
    return {
      id: userFromRequest.id,
      name: userFromRequest.name || "Authority",
      email: userFromRequest.email,
      role: "authority"
    };
  }

  const token = getAuthorizationToken(req);
  if (!token) {
    return undefined;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { id?: string; role?: string };

    if (!payload.id || payload.role !== "authority") {
      return undefined;
    }

    return await authService.getAuthorityById(payload.id);
  } catch {
    return undefined;
  }
};

export class IssueController {
  async createIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const issue = await issueService.createIssue(req.body);

      res.status(201).json(issue);
    } catch (error) {
      next(error);
    }
  }

  async createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = validateCreateReportInput(req.body);
      const authority = await getAuthenticatedAuthority(req);

      const created = await issueService.createIssue({
        title: input.title,
        description: input.description,
        category: input.category,
        location: {
          lat: input.latitude,
          lng: input.longitude
        },
        images: input.image ? [input.image] : []
      });

      const issue = await issueService.getIssueById(created.id);

      const actorUserId = authority?.id ?? getCurrentUserId(req);
      const socketId = actorUserId ? global.users?.[actorUserId] : undefined;

      console.log(`[Issue] Created issue: ${created.id}`);
      console.log(`[Notification] Actor userId: ${actorUserId}`);
      console.log(`[Notification] Socket ID: ${socketId ? socketId : "❌ NOT FOUND"}`);

      if (socketId && global.io) {
        global.io.to(socketId).emit("issueCreated", {
          message: "Issue submitted successfully ✅"
        });
        console.log(`[Notification] ✅ Socket.IO event emitted to ${socketId}`);
      } else {
        console.warn(`[Notification] ⚠️ Socket emit skipped (socketId: ${socketId}, io: ${global.io ? "ok" : "missing"})`);
      }

      if (authority?.email) {
        console.log(`[Email] Sending to: ${authority.email}`);
        try {
          await resendService.sendIssueCreatedEmail(authority.email, issue.description);
          console.log(`[Email] ✅ Email sent successfully to ${authority.email}`);
        } catch (emailError) {
          console.error(`[Email] ❌ Failed to send email to ${authority.email}:`, emailError);
        }
      } else {
        console.warn(`[Email] ⚠️ No authority email found`);
      }

      res.status(201).json(toReportResponse(issue));
    } catch (error) {
      next(error);
    }
  }

  async getIssues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter = parseGeoFilter(
        req.query.latitude,
        req.query.longitude,
        req.query.maxDistanceMeters
      );

      const issues = await issueService.getIssues(filter);

      res.status(200).json(issues);
    } catch (error) {
      next(error);
    }
  }

  async getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const issues = await issueService.getIssues();

      res.status(200).json(toReportListResponse(issues, getCurrentUserId(req)));
    } catch (error) {
      next(error);
    }
  }

  async getIssueStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await issueService.getIssueStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getIssueById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("Issue id is required", 400);
      }

      const issue = await issueService.getIssueById(id);

      res.status(200).json(issue);
    } catch (error) {
      next(error);
    }
  }

  async updateIssueStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("Issue id is required", 400);
      }

      const issue = await issueService.updateIssueStatus({
        issueId: id,
        status: req.body.status as IssueStatus
      });

      res.status(200).json(issue);
    } catch (error) {
      next(error);
    }
  }

  async previewLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const latitude = Number(req.query.latitude);
      const longitude = Number(req.query.longitude);

      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
        throw new AppError("latitude must be between -90 and 90", 400);
      }

      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        throw new AppError("longitude must be between -180 and 180", 400);
      }

      const address = await issueService.previewLocation(latitude, longitude);

      res.status(200).json({ address });
    } catch (error) {
      next(error);
    }
  }

  async voteOnIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = getVoteActorId(req);

      if (!id) {
        throw new AppError("Issue id is required", 400);
      }

      const issue = await issueService.voteOnIssue({
        issueId: id,
        userId,
        type: req.body.type as VoteType
      });

      res.status(200).json(toReportResponse(issue, userId));
    } catch (error) {
      next(error);
    }
  }
}

export const issueController = new IssueController();
