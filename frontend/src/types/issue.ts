export type IssueStatus = "reported" | "in_progress" | "resolved";

export type IssueCategory = "road" | "water" | "electricity" | "garbage";

export interface IssueLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: IssueLocation;
  images: string[];
  address: string;
  status: IssueStatus;
  assigned_to: string;
  priority_score: number;
  duplicate_of?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  category: IssueCategory;
  location: {
    lat: number;
    lng: number;
  };
  images: string[];
}

export interface CreateIssueResponse {
  id: string;
  status: IssueStatus;
  assigned_to: string;
  created_at: string;
  duplicate_of?: string;
}

export interface IssueStatusUpdateInput {
  issueId: string;
  status: IssueStatus;
}
