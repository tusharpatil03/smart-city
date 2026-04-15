import { useCallback, useState } from "react";
import { issueApi } from "../services/api";
import type {
  CreateIssueInput,
  CreateIssueResponse,
  Issue,
  IssueStatus
} from "../types/issue";

type LoadMode = "load" | "save";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T,>(mode: LoadMode, operation: () => Promise<T>): Promise<T> => {
    if (mode === "load") {
      setLoading(true);
    } else {
      setSaving(true);
    }

    setError(null);

    try {
      return await operation();
    } catch (error_) {
      const message = getErrorMessage(error_);
      setError(message);
      throw error_;
    } finally {
      if (mode === "load") {
        setLoading(false);
      } else {
        setSaving(false);
      }
    }
  }, []);

  const loadIssues = useCallback(async (): Promise<Issue[]> => {
    const response = await execute("load", () => issueApi.getIssues());
    setIssues(response);
    return response;
  }, [execute]);

  const loadIssue = useCallback(
    async (issueId: string): Promise<Issue> => {
      const response = await execute("load", () => issueApi.getIssueById(issueId));
      setIssue(response);
      return response;
    },
    [execute]
  );

  const createIssue = useCallback(
    async (input: CreateIssueInput): Promise<CreateIssueResponse> => {
      const response = await execute("save", () => issueApi.createIssue(input));
      return response;
    },
    [execute]
  );

  const updateStatus = useCallback(
    async (issueId: string, status: IssueStatus): Promise<Issue> => {
      const response = await execute("save", () => issueApi.updateIssueStatus(issueId, status));
      setIssue(response);
      setIssues((currentIssues) =>
        currentIssues.map((currentIssue) => (currentIssue._id === response._id ? response : currentIssue))
      );
      return response;
    },
    [execute]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    issues,
    issue,
    loading,
    saving,
    error,
    loadIssues,
    loadIssue,
    createIssue,
    updateStatus,
    clearError
  };
}
