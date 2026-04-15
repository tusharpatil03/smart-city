import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { useIssues } from "../hooks/useIssues";
import { useI18n } from "../i18n";
import type { IssueStatus } from "../types/issue";

const statusTransitions: Record<IssueStatus, IssueStatus[]> = {
  reported: ["in_progress", "resolved"],
  in_progress: ["resolved"],
  resolved: []
};

export function IssueDetailPage() {
  const { formatDateTime, t, translateCategory, translateStatus } = useI18n();
  const { isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { issue, loading, saving, error, loadIssue, updateStatus } = useIssues();

  useEffect(() => {
    if (!id) {
      return;
    }

    void loadIssue(id).catch(() => undefined);
  }, [id, loadIssue]);

  const handleStatusUpdate = async (status: IssueStatus): Promise<void> => {
    if (!id) {
      return;
    }

    try {
      await updateStatus(id, status);
    } catch {
      // The hook already stores the error message.
    }
  };

  if (!id) {
    return <div className="card state-card">{t("issueDetail.missingId")}</div>;
  }

  if (loading && issue === null) {
    return <div className="card state-card">{t("common.loadingIssue")}</div>;
  }

  if (issue === null) {
    return (
      <section className="page-stack">
        <Link className="back-link" to="/">
          {t("issueDetail.backToIssues")}
        </Link>
        {error !== null ? <div className="alert alert--error">{error}</div> : <div className="card state-card">{t("common.loadingIssue")}</div>}
      </section>
    );
  }

  const nextStatuses = statusTransitions[issue.status];

  return (
    <section className="page-stack">
      <Link className="back-link" to="/">
        {t("issueDetail.backToIssues")}
      </Link>

      <article className="card detail-card">
        <div className="detail-card__header">
          <div>
            <p className="eyebrow">{t("issueDetail.details")}</p>
            <h1>{issue.title}</h1>
          </div>
          <StatusBadge status={issue.status} />
        </div>

        <div className="detail-grid">
          <div className="detail-block">
            <h2>{t("common.description")}</h2>
            <p>{issue.description?.trim() || t("issueDetail.noDescription")}</p>
          </div>

          <div className="detail-block">
            <h2>{t("common.category")}</h2>
            <p>{translateCategory(issue.category)}</p>
          </div>

          <div className="detail-block">
            <h2>{t("common.location")}</h2>
            <p>
              {t("issueDetail.latitude")} {issue.location.coordinates[1].toFixed(6)}
              <br />
              {t("issueDetail.longitude")} {issue.location.coordinates[0].toFixed(6)}
            </p>
          </div>

          <div className="detail-block">
            <h2>{t("issueDetail.media")}</h2>
            {issue.images.length > 0 ? (
              <a href={issue.images[0]} target="_blank" rel="noreferrer">
                {t("issueDetail.openImage")}
              </a>
            ) : (
              <p>{t("issueDetail.noImage")}</p>
            )}
          </div>

          <div className="detail-block">
            <h2>{t("issueDetail.assignment")}</h2>
            <p>
              {issue.assigned_to.split("_").join(" ")}
              <br />
              {t("issueDetail.address")} {issue.address}
            </p>
          </div>

          <div className="detail-block">
            <h2>{t("issueDetail.timestamps")}</h2>
            <p>
              {t("issueDetail.created")} {formatDateTime(issue.created_at)}
              <br />
              {t("issueDetail.updated")} {formatDateTime(issue.updated_at)}
            </p>
          </div>
        </div>

        {error !== null ? <div className="alert alert--error">{error}</div> : null}

        <div className="status-actions">
          {!isAuthenticated ? (
            <p className="status-actions__note">
              {t("auth.authorityActionNotice")} <Link to="/authority/login">{t("auth.authorityLogin")}</Link>
            </p>
          ) : nextStatuses.length === 0 ? (
            <p className="status-actions__note">{t("issueDetail.alreadyResolved")}</p>
          ) : (
            nextStatuses.map((status) => (
              <button
                key={status}
                className="button button--secondary"
                type="button"
                onClick={() => {
                  void handleStatusUpdate(status);
                }}
                disabled={saving}
              >
                {t("issueDetail.markAs", { status: translateStatus(status) })}
              </button>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
