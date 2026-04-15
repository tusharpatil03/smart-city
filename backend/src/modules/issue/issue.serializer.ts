import { IssueDocument } from "./issue.model";
import { mapIssueCategoryToReferenceCategory, mapIssueStatusToReferenceStatus } from "./issue.types";

export interface ReportResponseDto {
  id: string;
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  address: string;
}

export const toReportResponse = (issue: IssueDocument): ReportResponseDto => {
  const latitude = issue.location.coordinates[1];
  const longitude = issue.location.coordinates[0];

  return {
    id: issue._id.toString(),
    title: issue.title,
    description: issue.description,
    category: mapIssueCategoryToReferenceCategory(issue.category),
    latitude,
    longitude,
    imageUrl: issue.images[0] ?? null,
    status: mapIssueStatusToReferenceStatus(issue.status),
    createdAt: issue.created_at.toISOString(),
    updatedAt: issue.updated_at.toISOString(),
    address: issue.address
  };
};

export const toReportListResponse = (issues: IssueDocument[]): ReportResponseDto[] => {
  return issues.map((issue) => toReportResponse(issue));
};
