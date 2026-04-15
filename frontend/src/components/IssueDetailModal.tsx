import { StatusBadge } from "./StatusBadge";
import { useI18n } from "../i18n";
import type { CivicIssue } from "../services/api";

interface IssueDetailModalProps {
  issue: CivicIssue | null;
  onClose: () => void;
}

export function IssueDetailModal({ issue, onClose }: IssueDetailModalProps) {
  const { formatDateTime, t, translateCategory } = useI18n();

  if (!issue) {
    return null;
  }

  return (
    <div className="issue-modal" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="issue-modal__backdrop" onClick={onClose} />
      <article className="issue-modal__panel">
        <button className="issue-modal__close" type="button" onClick={onClose} aria-label={t("modal.closeIssueDetails")}>
          ×
        </button>

        <div className="issue-modal__hero">
          {issue.imageUrl ? <img src={issue.imageUrl} alt={issue.title} /> : <div className="issue-modal__placeholder">📍</div>}
        </div>

        <div className="issue-modal__content">
          <div className="issue-modal__header">
            <div>
              <p className="issue-modal__category">{translateCategory(issue.category)}</p>
              <h2>{issue.title}</h2>
            </div>
            <StatusBadge status={issue.status} />
          </div>

          <p className="issue-modal__description">{issue.description}</p>

          <div className="issue-modal__grid">
            <div>
              <p className="issue-modal__label">{t("modal.reported")}</p>
              <p>{formatDateTime(issue.createdAt)}</p>
            </div>
            <div>
              <p className="issue-modal__label">{t("common.updated")}</p>
              <p>{formatDateTime(issue.updatedAt)}</p>
            </div>
            <div>
              <p className="issue-modal__label">{t("issueDetail.latitude")}</p>
              <p>{issue.latitude.toFixed(5)}</p>
            </div>
            <div>
              <p className="issue-modal__label">{t("issueDetail.longitude")}</p>
              <p>{issue.longitude.toFixed(5)}</p>
            </div>
          </div>

          {issue.address ? (
            <p className="issue-modal__address">{issue.address}</p>
          ) : null}
        </div>
      </article>
    </div>
  );
}
