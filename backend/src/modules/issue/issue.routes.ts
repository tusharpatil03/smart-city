import { Router } from "express";
import {
  validateIssueIdParam,
  validateStatusUpdateRequest
} from "../../shared/middleware/validate.middleware";
import { issueController } from "./issue.controller";

const issueRouter = Router();

issueRouter.post("/report", (req, res, next) => {
  void issueController.createReport(req, res, next);
});

issueRouter.get("/reports", (req, res, next) => {
  void issueController.getReports(req, res, next);
});

issueRouter.post("/", (req, res, next) => {
  void issueController.createIssue(req, res, next);
});

issueRouter.get("/", (req, res, next) => {
  void issueController.getIssues(req, res, next);
});

issueRouter.get("/:id", validateIssueIdParam, (req, res, next) => {
  void issueController.getIssueById(req, res, next);
});

issueRouter.patch("/:id/status", validateIssueIdParam, validateStatusUpdateRequest, (req, res, next) => {
  void issueController.updateIssueStatus(req, res, next);
});

export { issueRouter };
