import { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/middleware/error.middleware";
import { parseGeoFilter } from "../../shared/utils/geo.utils";
import { issueService } from "./issue.service";
import { toReportListResponse, toReportResponse } from "./issue.serializer";
import { IssueStatus } from "./issue.types";
import { validateCreateReportInput } from "./issue.validator";

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

      res.status(200).json(toReportListResponse(issues));
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
}

export const issueController = new IssueController();
