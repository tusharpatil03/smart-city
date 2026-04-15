import { IssueDocument } from "./issue.model";
import {
  VoteType,
  mapIssueCategoryToReferenceCategory,
  mapIssueStatusToReferenceStatus
} from "./issue.types";

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
  upvotes: number;
  downvotes: number;
  netScore: number;
  currentUserVote: VoteType | null;
}

export const toReportResponse = (
  issue: IssueDocument,
  currentUserId?: string
): ReportResponseDto => {
  const latitude = issue.location.coordinates[1];
  const longitude = issue.location.coordinates[0];
  const votes = issue.votes ?? [];
  const upvotes = votes.filter((vote) => vote.type === "upvote").length;
  const downvotes = votes.filter((vote) => vote.type === "downvote").length;
  const currentUserVote =
    currentUserId === undefined
      ? null
      : votes.find((vote) => String(vote.userId) === currentUserId)?.type ?? null;

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
    address: issue.address,
    upvotes,
    downvotes,
    netScore: upvotes - downvotes,
    currentUserVote
  };
};

export const toReportListResponse = (
  issues: IssueDocument[],
  currentUserId?: string
): ReportResponseDto[] => {
  return issues.map((issue) => toReportResponse(issue, currentUserId));
};
