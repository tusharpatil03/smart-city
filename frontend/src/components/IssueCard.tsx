import type { CivicIssue, VoteType } from "../services/api";
import { useI18n } from "../i18n";
import { StatusBadge } from "./StatusBadge";

interface IssueCardProps {
  issue: CivicIssue;
  onClick?: (issue: CivicIssue) => void;
  onVote?: (issue: CivicIssue, type: VoteType) => void;
  isVoting?: boolean;
}

const categoryEmoji: Record<CivicIssue["category"], string> = {
  Pothole: "🕳️",
  Garbage: "🗑️",
  Streetlight: "💡",
  Flooding: "🌊",
  Graffiti: "🎨",
  "Road Damage": "🚧",
  Other: "📍"
};

export function IssueCard({ issue, onClick, onVote, isVoting = false }: IssueCardProps) {
  const { formatDateTime, translateCategory } = useI18n();

  return (
    <article className="issue-card">
      <button className="issue-card__surface" type="button" onClick={() => onClick?.(issue)}>
        <div className="issue-card__media">
          {issue.imageUrl ? (
            <img src={issue.imageUrl} alt={issue.title} loading="lazy" />
          ) : (
            <div className="issue-card__placeholder">{categoryEmoji[issue.category]}</div>
          )}

          <div className="issue-card__chip">{translateCategory(issue.category)}</div>
          <div className="issue-card__badge-wrap">
            <StatusBadge status={issue.status} size="sm" />
          </div>
        </div>

        <div className="issue-card__content">
          <h3>{issue.title}</h3>
          <p className="issue-card__description">{issue.description}</p>

          <p className="issue-card__meta">
            {issue.address ?? `${issue.latitude.toFixed(5)}, ${issue.longitude.toFixed(5)}`}
          </p>

          <p className="issue-card__meta">
            {formatDateTime(issue.createdAt, { dateStyle: "medium" })}
          </p>
        </div>
      </button>

      <div className="issue-card__votes">
        <div className="issue-card__vote-buttons">
          <button
            className={`issue-card__vote-button issue-card__vote-button--upvote ${
              issue.currentUserVote === "upvote" ? "is-active" : ""
            }`}
            type="button"
            onClick={() => onVote?.(issue, "upvote")}
            disabled={isVoting}
            aria-label={`Upvote ${issue.title}`}
          >
            <span aria-hidden="true">👍</span>
            <span>{issue.upvotes}</span>
          </button>

          <button
            className={`issue-card__vote-button issue-card__vote-button--downvote ${
              issue.currentUserVote === "downvote" ? "is-active" : ""
            }`}
            type="button"
            onClick={() => onVote?.(issue, "downvote")}
            disabled={isVoting}
            aria-label={`Downvote ${issue.title}`}
          >
            <span aria-hidden="true">👎</span>
            <span>{issue.downvotes}</span>
          </button>
        </div>

        <span className={`issue-card__score ${issue.netScore >= 0 ? "is-positive" : "is-negative"}`}>
          {issue.netScore >= 0 ? `+${issue.netScore}` : issue.netScore}
        </span>
      </div>
    </article>
  );
}
