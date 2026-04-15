import { uploadImages } from "../../integrations/cloudinary.service";
import { reverseGeocode } from "../../integrations/maps.service";
import { AppError } from "../../shared/middleware/error.middleware";
import { GeoFilter } from "../../shared/utils/geo.utils";
import { CreateIssueRepositoryInput, issueRepository } from "./issue.repository";
import { validateCreateIssueInput } from "./issue.validator";
import {
  CreateIssueServiceOutput,
  IssueCategory,
  IssueStatus,
  UpdateIssueStatusInput
} from "./issue.types";

const statusTransitionMap: Record<IssueStatus, IssueStatus[]> = {
  [IssueStatus.REPORTED]: [IssueStatus.IN_PROGRESS, IssueStatus.RESOLVED],
  [IssueStatus.IN_PROGRESS]: [IssueStatus.RESOLVED],
  [IssueStatus.RESOLVED]: []
};

const authorityMap: Record<IssueCategory, string> = {
  road: "road_department",
  water: "water_department",
  electricity: "electricity_department",
  garbage: "waste_management"
};

const getAssignedAuthority = (category: IssueCategory): string => authorityMap[category];

export class IssueService {
  async createIssue(rawInput: unknown): Promise<CreateIssueServiceOutput> {
    const input = validateCreateIssueInput(rawInput);
    const imageUrls = await uploadImages(input.images);
    const address = await reverseGeocode(input.location.lat, input.location.lng);
    const assignedAuthority = getAssignedAuthority(input.category);
    const duplicate = await issueRepository.findNearbyByCategory(
      input.category,
      input.location.lng,
      input.location.lat,
      50
    );

    const repositoryInput: CreateIssueRepositoryInput = {
      title: input.title,
      description: input.description,
      category: input.category,
      location: {
        type: "Point",
        coordinates: [input.location.lng, input.location.lat]
      },
      images: imageUrls,
      address,
      status: IssueStatus.REPORTED,
      assigned_to: assignedAuthority,
      priority_score: 0
    };

    if (duplicate) {
      repositoryInput.duplicate_of = duplicate._id.toString();
    }

    const createdIssue = await issueRepository.createIssue(repositoryInput);

    console.log("[event] issue.created", {
      issueId: createdIssue._id.toString(),
      category: createdIssue.category,
      assigned_to: createdIssue.assigned_to,
      duplicate_of: createdIssue.duplicate_of?.toString()
    });

    return {
      id: createdIssue._id.toString(),
      status: createdIssue.status,
      assigned_to: createdIssue.assigned_to,
      created_at: createdIssue.created_at.toISOString(),
      ...(createdIssue.duplicate_of ? { duplicate_of: createdIssue.duplicate_of.toString() } : {})
    };
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
