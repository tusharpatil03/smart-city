import { Link } from "react-router-dom";
import type { Issue } from "../types/issue";
import { StatusBadge } from "./StatusBadge";

interface IssueCardProps {
  issue: Issue;
}

const formatDescription = (description: string | undefined): string => {
  const text = description?.trim();

  if (!text) {
    return "No description provided.";
  }

  if (text.length <= 140) {
    return text;
  }

  return `${text.slice(0, 137)}...`;
};

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Link className="issue-card" to={`/issues/${issue._id}`}>
      <div className="issue-card__header">
        <h3>{issue.title}</h3>
        <StatusBadge status={issue.status} />
      </div>

      <p className="issue-card__description">{formatDescription(issue.description)}</p>

      <p className="issue-card__meta">
        Coordinates: {issue.location.coordinates[1].toFixed(4)}, {issue.location.coordinates[0].toFixed(4)}
      </p>
    </Link>
  );
}
