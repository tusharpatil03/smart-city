import { Types } from "mongoose";

export enum IssueStatus {
  REPORTED = "reported",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved"
}

export const ISSUE_CATEGORIES = ["road", "water", "electricity", "garbage"] as const;
export const REFERENCE_CATEGORIES = [
  "Pothole",
  "Garbage",
  "Streetlight",
  "Flooding",
  "Graffiti",
  "Road Damage",
  "Other"
] as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];
export type ReferenceCategory = (typeof REFERENCE_CATEGORIES)[number];

const referenceCategoryToIssueCategory: Record<ReferenceCategory, IssueCategory> = {
  Pothole: "road",
  "Road Damage": "road",
  Streetlight: "electricity",
  Flooding: "water",
  Garbage: "garbage",
  Graffiti: "garbage",
  Other: "road"
};

export const mapReferenceCategoryToIssueCategory = (
  category: ReferenceCategory
): IssueCategory => referenceCategoryToIssueCategory[category];

export const mapIssueCategoryToReferenceCategory = (
  category: IssueCategory
): ReferenceCategory => {
  switch (category) {
    case "road":
      return "Road Damage";
    case "water":
      return "Flooding";
    case "electricity":
      return "Streetlight";
    case "garbage":
      return "Garbage";
    default:
      return "Other";
  }
};

export const mapIssueStatusToReferenceStatus = (status: IssueStatus): string => {
  switch (status) {
    case IssueStatus.REPORTED:
      return "Reported";
    case IssueStatus.IN_PROGRESS:
      return "In Progress";
    case IssueStatus.RESOLVED:
      return "Resolved";
    default:
      return "Reported";
  }
};

export interface IssueLocationInput {
  lat: number;
  lng: number;
}

export interface IssueLocation {
  type: "Point";
  coordinates: [number, number];
}

export type VoteType = "upvote" | "downvote";

export interface IssueVote {
  userId: string;
  type: VoteType;
}

export interface Issue {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: IssueCategory;
  location: IssueLocation;
  images: string[];
  address: string;
  status: IssueStatus;
  assigned_to: string;
  priority_score: number;
  duplicate_of?: Types.ObjectId;
  votes: IssueVote[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateIssueRequestDto {
  title: string;
  description: string;
  category: IssueCategory;
  location: IssueLocationInput;
  images: string[];
}

export interface CreateReportRequestDto {
  title: string;
  description: string;
  category: IssueCategory;
  latitude: number;
  longitude: number;
  image: string | null;
}

export interface CreateIssueServiceOutput {
  id: string;
  status: IssueStatus;
  assigned_to: string;
  created_at: string;
  duplicate_of?: string;
}

export interface ListIssueInput {
  latitude?: number;
  longitude?: number;
  maxDistanceMeters?: number;
}

export interface UpdateIssueStatusInput {
  issueId: string;
  status: IssueStatus;
}

export interface VoteOnIssueInput {
  issueId: string;
  userId: string;
  type: VoteType;
}
