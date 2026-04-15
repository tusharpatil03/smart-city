import type { CreateIssueInput, CreateIssueResponse, Issue, IssueStatus } from "../types/issue";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");

type QueryValue = string | number | undefined;

interface CreateIssueRequestBody {
  title: string;
  description: string;
  category: CreateIssueInput["category"];
  location: {
    lat: number;
    lng: number;
  };
  images: string[];
}

interface StatusUpdateRequestBody {
  status: IssueStatus;
}

export type CivicIssueStatus = "Reported" | "In Progress" | "Resolved";

export type CivicIssueCategory =
  | "Pothole"
  | "Garbage"
  | "Streetlight"
  | "Flooding"
  | "Graffiti"
  | "Road Damage"
  | "Other";

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: CivicIssueCategory;
  status: CivicIssueStatus;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  address?: string;
}

export interface CreateReportInput {
  title: string;
  description: string;
  category: CivicIssueCategory;
  latitude: number;
  longitude: number;
  image?: string | null;
}

interface ReportApiResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  address?: string;
}

const buildUrl = (path: string): string => `${API_BASE_URL}${path}`;

const buildQueryString = (params: Record<string, QueryValue>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.length > 0) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : "";
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as {
      error?: unknown;
      success?: boolean;
    };

    if (
      payload.error &&
      typeof payload.error === "object" &&
      "message" in payload.error &&
      typeof (payload.error as { message?: unknown }).message === "string"
    ) {
      return (payload.error as { message: string }).message;
    }

    if (typeof payload.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }
  } catch {
    // Ignore non-JSON responses and fall back to a generic message.
  }

  return `Request failed with status ${response.status}`;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface IssueListFilter {
  latitude?: number;
  longitude?: number;
  maxDistanceMeters?: number;
}

export const issueApi = {
  async getIssues(filter?: IssueListFilter): Promise<Issue[]> {
    const path = filter
      ? `/api/issues${buildQueryString({
          latitude: filter.latitude,
          longitude: filter.longitude,
          maxDistanceMeters: filter.maxDistanceMeters
        })}`
      : "/api/issues";

    return request<Issue[]>(path);
  },

  async getIssueById(issueId: string): Promise<Issue> {
    return request<Issue>(`/api/issues/${issueId}`);
  },

  async createIssue(input: CreateIssueInput): Promise<CreateIssueResponse> {
    const body: CreateIssueRequestBody = {
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      images: input.images
    };

    return request<CreateIssueResponse>("/api/issues", {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  async updateIssueStatus(issueId: string, status: IssueStatus): Promise<Issue> {
    const body: StatusUpdateRequestBody = { status };

    return request<Issue>(`/api/issues/${issueId}/status`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  }
};

const categoryFromBackend = (category: string): CivicIssueCategory => {
  switch (category) {
    case "Pothole":
    case "Garbage":
    case "Streetlight":
    case "Flooding":
    case "Graffiti":
    case "Road Damage":
    case "Other":
      return category;
    default:
      return "Other";
  }
};

const statusFromBackend = (status: string): CivicIssueStatus => {
  switch (status) {
    case "Reported":
    case "In Progress":
    case "Resolved":
      return status;
    case "reported":
      return "Reported";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    default:
      return "Reported";
  }
};

const toCivicIssue = (issue: ReportApiResponse): CivicIssue => {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    category: categoryFromBackend(issue.category),
    status: statusFromBackend(issue.status),
    latitude: issue.latitude,
    longitude: issue.longitude,
    imageUrl: issue.imageUrl ?? undefined,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    address: issue.address
  };
};

export const civicApi = {
  async getReports(): Promise<CivicIssue[]> {
    const reports = await request<ReportApiResponse[]>("/api/reports");
    return reports.map((report) => toCivicIssue(report));
  },

  async createReport(input: CreateReportInput): Promise<CivicIssue> {
    const body = {
      title: input.title,
      description: input.description,
      category: input.category,
      latitude: input.latitude,
      longitude: input.longitude,
      image: input.image ?? null
    };

    const report = await request<ReportApiResponse>("/api/report", {
      method: "POST",
      body: JSON.stringify(body)
    });

    return toCivicIssue(report);
  }
};
