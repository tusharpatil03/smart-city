import { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/middleware/error.middleware";
import { parseGeoFilter } from "../../shared/utils/geo.utils";
import { issueService } from "./issue.service";
import { CreateIssueInput, IssueStatus } from "./issue.types";

export class IssueController {
  async createIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreateIssueInput;

      const createInput: CreateIssueInput = {
        title: body.title,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude)
      };

      if (body.description !== undefined) {
        createInput.description = body.description;
      }

      if (body.image_url !== undefined) {
        createInput.image_url = body.image_url;
      }

      const issue = await issueService.createIssue(createInput);

      res.status(201).json(issue);
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
