export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface IssueLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface Issue {
  _id: string;
  title: string;
  description?: string;
  location: IssueLocation;
  image_url?: string;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
}

export interface IssueStatusUpdateInput {
  issueId: string;
  status: IssueStatus;
}
