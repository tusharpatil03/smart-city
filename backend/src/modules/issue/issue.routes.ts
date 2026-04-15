import { Router } from "express";
import {
  validateIssueIdParam,
  validateStatusUpdateRequest,
  validateVoteUpdateRequest
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

issueRouter.get("/location-preview", (req, res, next) => {
  void issueController.previewLocation(req, res, next);
});

issueRouter.get("/:id", validateIssueIdParam, (req, res, next) => {
  void issueController.getIssueById(req, res, next);
});

issueRouter.patch("/:id/status", validateIssueIdParam, validateStatusUpdateRequest, (req, res, next) => {
  void issueController.updateIssueStatus(req, res, next);
});

issueRouter.put("/:id/vote", validateIssueIdParam, validateVoteUpdateRequest, (req, res, next) => {
  void issueController.voteOnIssue(req, res, next);
});

export { issueRouter };
