import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IssueCard } from "../components/IssueCard";
import { IssueDetailModal } from "../components/IssueDetailModal";
import { MapView } from "../components/MapView";
import { civicApi, type CivicIssue } from "../services/api";

export function HomePage() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    civicApi
      .getReports()
      .then((data) => {
        if (!mounted) {
          return;
        }

        setIssues(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) {
          return;
        }

        setError(err instanceof Error ? err.message : "Failed to load issues");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = {
    total: issues.length,
    reported: issues.filter((issue) => issue.status === "Reported").length,
    inProgress: issues.filter((issue) => issue.status === "In Progress").length,
    resolved: issues.filter((issue) => issue.status === "Resolved").length
  };

  return (
    <section className="civic-page">
      <section className="hero">
        <div className="hero__noise" aria-hidden="true" />
        <div className="hero__content">
          <p className="hero__chip">{stats.total} issues tracked citywide</p>
          <h1>
            Report civic issues,
            <br />
            <span>build a better city.</span>
          </h1>
          <p>
            Spotted a pothole, broken streetlight, or overflowing garbage? Report it in seconds and
            track its progress from report to resolution.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/report">
              + Report Issue
            </Link>
            <Link className="button button--ghost" to="/issues">
              Browse Issues
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Issue stats">
        <article className="stat-card">
          <p>Total Issues</p>
          <strong>{stats.total}</strong>
        </article>
        <article className="stat-card">
          <p>Reported</p>
          <strong>{stats.reported}</strong>
        </article>
        <article className="stat-card">
          <p>In Progress</p>
          <strong>{stats.inProgress}</strong>
        </article>
        <article className="stat-card">
          <p>Resolved</p>
          <strong>{stats.resolved}</strong>
        </article>
      </section>

      <section className="panel">
        <header className="panel__header">
          <h2>Live Issue Map</h2>
        </header>
        <div className="panel__map">
          {loading ? <div className="state-card">Loading map...</div> : null}
          {!loading ? (
            <MapView issues={issues} showCurrentLocation onMarkerClick={(issue) => setSelectedIssue(issue)} />
          ) : null}
        </div>
      </section>

      <section className="recent-section">
        <header className="recent-section__header">
          <h2>Recent Issues</h2>
          <Link to="/issues">View all →</Link>
        </header>

        {error ? <div className="alert alert--error">{error}</div> : null}

        <div className="cards-grid">
          {issues.slice(0, 3).map((issue) => (
            <IssueCard key={issue.id} issue={issue} onClick={(item) => setSelectedIssue(item)} />
          ))}
        </div>
      </section>

      <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </section>
  );
}
