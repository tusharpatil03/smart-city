import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useIssues } from "../hooks/useIssues";
import type { IssueStatus } from "../types/issue";

const statusTransitions: Record<IssueStatus, IssueStatus[]> = {
  reported: ["in_progress", "resolved"],
  in_progress: ["resolved"],
  resolved: []
};

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

export function IssueDetailPage() {
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
    return <div className="card state-card">Missing issue id.</div>;
  }

  if (loading && issue === null) {
    return <div className="card state-card">Loading issue...</div>;
  }

  if (issue === null) {
    return (
      <section className="page-stack">
        <Link className="back-link" to="/">
          Back to issues
        </Link>
        {error !== null ? <div className="alert alert--error">{error}</div> : <div className="card state-card">Loading issue...</div>}
      </section>
    );
  }

  const nextStatuses = statusTransitions[issue.status];

  return (
    <section className="page-stack">
      <Link className="back-link" to="/">
        Back to issues
      </Link>

      <article className="card detail-card">
        <div className="detail-card__header">
          <div>
            <p className="eyebrow">Issue details</p>
            <h1>{issue.title}</h1>
          </div>
          <StatusBadge status={issue.status} />
        </div>

        <div className="detail-grid">
          <div className="detail-block">
            <h2>Description</h2>
            <p>{issue.description?.trim() || "No description provided."}</p>
          </div>

          <div className="detail-block">
            <h2>Category</h2>
            <p>{issue.category}</p>
          </div>

          <div className="detail-block">
            <h2>Location</h2>
            <p>
              Latitude {issue.location.coordinates[1].toFixed(6)}
              <br />
              Longitude {issue.location.coordinates[0].toFixed(6)}
            </p>
          </div>

          <div className="detail-block">
            <h2>Media</h2>
            {issue.images.length > 0 ? (
              <a href={issue.images[0]} target="_blank" rel="noreferrer">
                Open image
              </a>
            ) : (
              <p>No image attached.</p>
            )}
          </div>

          <div className="detail-block">
            <h2>Assignment</h2>
            <p>
              {issue.assigned_to.split("_").join(" ")}
              <br />
              Address {issue.address}
            </p>
          </div>

          <div className="detail-block">
            <h2>Timestamps</h2>
            <p>
              Created {formatDate(issue.created_at)}
              <br />
              Updated {formatDate(issue.updated_at)}
            </p>
          </div>
        </div>

        {error !== null ? <div className="alert alert--error">{error}</div> : null}

        <div className="status-actions">
          {nextStatuses.length === 0 ? (
            <p className="status-actions__note">This issue is already resolved.</p>
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
                Mark as {status.replace("_", " ")}
              </button>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
