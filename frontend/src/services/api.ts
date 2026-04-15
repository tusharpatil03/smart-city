import type { CreateIssueInput, Issue, IssueStatus } from "../types/issue";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");

type QueryValue = string | number | undefined;

interface CreateIssueRequestBody {
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
  image_url?: string;
}

interface StatusUpdateRequestBody {
  status: IssueStatus;
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
    const payload = (await response.json()) as { error?: unknown };

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
      ? `/issues${buildQueryString({
          latitude: filter.latitude,
          longitude: filter.longitude,
          maxDistanceMeters: filter.maxDistanceMeters
        })}`
      : "/issues";

    return request<Issue[]>(path);
  },

  async getIssueById(issueId: string): Promise<Issue> {
    return request<Issue>(`/issues/${issueId}`);
  },

  async createIssue(input: CreateIssueInput): Promise<Issue> {
    const body: CreateIssueRequestBody = {
      title: input.title,
      latitude: input.latitude,
      longitude: input.longitude
    };

    if (input.description !== undefined && input.description.trim().length > 0) {
      body.description = input.description;
    }

    if (input.image_url !== undefined && input.image_url.trim().length > 0) {
      body.image_url = input.image_url;
    }

    return request<Issue>("/issues", {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  async updateIssueStatus(issueId: string, status: IssueStatus): Promise<Issue> {
    const body: StatusUpdateRequestBody = { status };

    return request<Issue>(`/issues/${issueId}/status`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  }
};
