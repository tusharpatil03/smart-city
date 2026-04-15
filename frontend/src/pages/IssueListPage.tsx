import { useEffect } from "react";
import { Link } from "react-router-dom";
import { IssueCard } from "../components/IssueCard";
import { useIssues } from "../hooks/useIssues";

export function IssueListPage() {
  const { issues, loading, error, loadIssues } = useIssues();

  useEffect(() => {
    void loadIssues().catch(() => undefined);
  }, [loadIssues]);

  return (
    <section className="page-stack">
      <div className="page-heading page-heading--split">
        <div>
          <p className="eyebrow">Issue feed</p>
          <h1>Track reported issues</h1>
        </div>

        <Link className="button button--primary" to="/create">
          Create issue
        </Link>
      </div>

      {loading ? <div className="card state-card">Loading issues...</div> : null}
      {error !== null ? <div className="alert alert--error">{error}</div> : null}

      {!loading && error === null && issues.length === 0 ? (
        <div className="card state-card">
          <h2>No issues yet</h2>
          <p>Create the first issue to start the feed.</p>
        </div>
      ) : null}

      <div className="issue-list">
        {issues.map((issue) => (
          <IssueCard key={issue._id} issue={issue} />
        ))}
      </div>
    </section>
  );
}
