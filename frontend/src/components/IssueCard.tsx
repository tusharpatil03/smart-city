import type { CivicIssue } from "../services/api";
import { StatusBadge } from "./StatusBadge";

interface IssueCardProps {
  issue: CivicIssue;
  onClick?: (issue: CivicIssue) => void;
}

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
};

const categoryEmoji: Record<CivicIssue["category"], string> = {
  Pothole: "🕳️",
  Garbage: "🗑️",
  Streetlight: "💡",
  Flooding: "🌊",
  Graffiti: "🎨",
  "Road Damage": "🚧",
  Other: "📍"
};

export function IssueCard({ issue, onClick }: IssueCardProps) {
  return (
    <button className="issue-card" type="button" onClick={() => onClick?.(issue)}>
      <div className="issue-card__media">
        {issue.imageUrl ? (
          <img src={issue.imageUrl} alt={issue.title} loading="lazy" />
        ) : (
          <div className="issue-card__placeholder">{categoryEmoji[issue.category]}</div>
        )}

        <div className="issue-card__chip">{issue.category}</div>
        <div className="issue-card__badge-wrap">
          <StatusBadge status={issue.status} size="sm" />
        </div>
      </div>

      <div className="issue-card__content">
        <h3>{issue.title}</h3>
        <p className="issue-card__description">{issue.description}</p>

        <p className="issue-card__meta">{issue.address ?? `${issue.latitude.toFixed(5)}, ${issue.longitude.toFixed(5)}`}</p>

        <p className="issue-card__meta">{formatDate(issue.createdAt)}</p>
      </div>
    </button>
  );
}
