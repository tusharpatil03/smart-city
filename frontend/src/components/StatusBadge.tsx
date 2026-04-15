import type { CivicIssueStatus } from "../services/api";
import { useI18n } from "../i18n";
import type { IssueStatus } from "../types/issue";

interface StatusBadgeProps {
  status: IssueStatus | CivicIssueStatus;
  size?: "sm" | "md";
}

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

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const { translateStatus } = useI18n();
  const canonical = toCanonicalStatus(status);

  return (
    <span className={`status-badge status-badge--${canonical} status-badge--${size}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {translateStatus(status)}
    </span>
  );
}
