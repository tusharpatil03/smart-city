import { AppError } from "../../shared/middleware/error.middleware";
import { GeoFilter } from "../../shared/utils/geo.utils";
import { CreateIssueRepositoryInput, issueRepository } from "./issue.repository";
import {
  CreateIssueInput,
  IssueStatus,
  UpdateIssueStatusInput
} from "./issue.types";

const statusTransitionMap: Record<IssueStatus, IssueStatus[]> = {
  [IssueStatus.OPEN]: [IssueStatus.IN_PROGRESS, IssueStatus.RESOLVED],
  [IssueStatus.IN_PROGRESS]: [IssueStatus.RESOLVED],
  [IssueStatus.RESOLVED]: []
};

export class IssueService {
  async createIssue(input: CreateIssueInput) {
    const repositoryInput: CreateIssueRepositoryInput = {
      title: input.title,
      location: {
        type: "Point",
        coordinates: [input.longitude, input.latitude]
      }
    };

    if (input.description !== undefined) {
      repositoryInput.description = input.description;
    }

    if (input.image_url !== undefined) {
      repositoryInput.image_url = input.image_url;
    }

    return issueRepository.create(repositoryInput);
  }

  async getIssues(filter?: GeoFilter | null) {
    // Geospatial filtering is optional for MVP; if filter is invalid/missing, return all.
    return issueRepository.findAll(filter ?? undefined);
  }

  async getIssueById(id: string) {
    const issue = await issueRepository.findById(id);

    if (!issue) {
      throw new AppError("Issue not found", 404);
    }

    return issue;
  }

  async updateIssueStatus(input: UpdateIssueStatusInput) {
    const issue = await issueRepository.findById(input.issueId);

    if (!issue) {
      throw new AppError("Issue not found", 404);
    }

    if (issue.status === input.status) {
      return issue;
    }

    const allowedTransitions = statusTransitionMap[issue.status];

    if (!allowedTransitions.includes(input.status)) {
      throw new AppError(
        `Invalid status transition from ${issue.status} to ${input.status}`,
        400
      );
    }

    const updated = await issueRepository.updateStatus(input.issueId, input.status);

    if (!updated) {
      throw new AppError("Issue not found", 404);
    }

    return updated;
  }
}

export const issueService = new IssueService();
