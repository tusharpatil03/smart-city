import { Types } from "mongoose";

export enum IssueStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED"
}

export interface IssueLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface Issue {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  location: IssueLocation;
  image_url?: string;
  status: IssueStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
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
