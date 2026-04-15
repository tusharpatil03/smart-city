import type { IssueStatus } from "../types/issue";

interface StatusBadgeProps {
  status: IssueStatus;
}

const statusLabels: Record<IssueStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved"
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${status.toLowerCase()}`}>{statusLabels[status]}</span>;
}
