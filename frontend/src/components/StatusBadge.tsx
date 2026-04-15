import type { CivicIssueStatus } from "../services/api";
import type { IssueStatus } from "../types/issue";

interface StatusBadgeProps {
  status: IssueStatus | CivicIssueStatus;
  size?: "sm" | "md";
}

const legacyStatusLabels: Record<IssueStatus, string> = {
  reported: "Reported",
  in_progress: "In progress",
  resolved: "Resolved"
};

const toCanonicalStatus = (status: IssueStatus | CivicIssueStatus): "reported" | "in_progress" | "resolved" => {
  if (status === "reported" || status === "in_progress" || status === "resolved") {
    return status;
  }

  if (status === "In Progress") {
    return "in_progress";
  }

  if (status === "Resolved") {
    return "resolved";
  }

  return "reported";
};

const toLabel = (status: IssueStatus | CivicIssueStatus): string => {
  if (status === "reported" || status === "in_progress" || status === "resolved") {
    return legacyStatusLabels[status];
  }

  return status;
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const canonical = toCanonicalStatus(status);

  return (
    <span className={`status-badge status-badge--${canonical} status-badge--${size}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {toLabel(status)}
    </span>
  );
}
