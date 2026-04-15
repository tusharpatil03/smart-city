import { useEffect, useMemo, useState } from "react";
import { IssueDetailModal } from "../components/IssueDetailModal";
import { civicApi, issueApi, type CivicIssue, type CivicIssueStatus, type IssueStats } from "../services/api";
import { useI18n } from "../i18n";
import type { IssueStatus } from "../types/issue";

const statusOptions: CivicIssueStatus[] = ["Reported", "In Progress"];

const toLegacyStatus = (status: CivicIssueStatus): IssueStatus => {
  switch (status) {
    case "Reported":
      return "reported";
    case "In Progress":
      return "in_progress";
    case "Resolved":
      return "resolved";
    default:
      return "reported";
  }
};

export function AdminPanelPage() {
  const { formatDateTime, t, translateCategory, translateStatus } = useI18n();
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CivicIssueStatus | "All">("All");
  const [draftStatusById, setDraftStatusById] = useState<Record<string, CivicIssueStatus>>({});
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const [reports, reportStats] = await Promise.all([civicApi.getReports(), civicApi.getIssueStats()]);
      // Admin queue only shows active work items; resolved issues are removed from this panel.
      const activeIssues = reports.filter((issue) => issue.status !== "Resolved");
      setIssues(activeIssues);
      setStats(reportStats);
      setDraftStatusById(
        activeIssues.reduce<Record<string, CivicIssueStatus>>((acc, issue) => {
          acc[issue.id] = issue.status;
          return acc;
        }, {})
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        issue.title.toLowerCase().includes(normalizedQuery) ||
        issue.description.toLowerCase().includes(normalizedQuery) ||
        issue.category.toLowerCase().includes(normalizedQuery) ||
        (issue.address ?? "").toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [issues, query, statusFilter]);

  const fallbackStats = useMemo<IssueStats>(() => {
    return {
      total: issues.length,
      reported: issues.filter((issue) => issue.status === "Reported").length,
      inProgress: issues.filter((issue) => issue.status === "In Progress").length,
      resolved: issues.filter((issue) => issue.status === "Resolved").length
    };
  }, [issues]);

  const displayStats = stats ?? fallbackStats;

  const updateIssueStatus = async (issueId: string): Promise<void> => {
    const nextStatus = draftStatusById[issueId];
    if (!nextStatus) {
      return;
    }

    setSavingId(issueId);
    setError(null);

    try {
      await issueApi.updateIssueStatus(issueId, toLegacyStatus(nextStatus));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.updateFailed"));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="civic-page civic-page--subtle">
      <header className="admin-header">
        <div>
          <h1>{t("admin.title")}</h1>
          <p>{t("admin.subtitle")}</p>
        </div>
        <button className="button button--secondary" type="button" onClick={() => void loadData()} disabled={loading}>
          {loading ? t("admin.refreshing") : t("admin.refresh")}
        </button>
      </header>

      <section className="admin-stats-grid" aria-label={t("admin.statsAria")}>
        <article className="admin-stat-card">
          <p>{t("home.totalIssues")}</p>
          <strong>{displayStats.total}</strong>
        </article>
        <article className="admin-stat-card">
          <p>{t("status.reported")}</p>
          <strong>{displayStats.reported}</strong>
        </article>
        <article className="admin-stat-card">
          <p>{t("status.inProgress")}</p>
          <strong>{displayStats.inProgress}</strong>
        </article>
        <article className="admin-stat-card">
          <p>{t("status.resolved")}</p>
          <strong>{displayStats.resolved}</strong>
        </article>
      </section>

      <section className="panel admin-controls">
        <div className="admin-controls__row">
          <input
            type="search"
            value={query}
            placeholder={t("admin.searchPlaceholder")}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              const nextStatus = event.target.value;
              if (nextStatus === "All" || nextStatus === "Reported" || nextStatus === "In Progress" || nextStatus === "Resolved") {
                setStatusFilter(nextStatus);
              }
            }}
          >
            <option value="All">{t("status.all")}</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {translateStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error ? <div className="alert alert--error">{error}</div> : null}

      {loading ? <div className="state-card">{t("admin.loading")}</div> : null}

      {!loading ? (
        <section className="panel admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("admin.issue")}</th>
                  <th>{t("common.category")}</th>
                  <th>{t("issueList.status")}</th>
                  <th>{t("admin.votes")}</th>
                  <th>{t("admin.created")}</th>
                  <th>{t("admin.action")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <div className="admin-table__issue">
                        <strong>{issue.title}</strong>
                        <p>{issue.address ?? `${issue.latitude.toFixed(5)}, ${issue.longitude.toFixed(5)}`}</p>
                      </div>
                    </td>
                    <td>{translateCategory(issue.category)}</td>
                    <td>
                      <span className="admin-pill">{translateStatus(issue.status)}</span>
                    </td>
                    <td>
                      <span className="admin-votes">{issue.netScore}</span>
                    </td>
                    <td>{formatDateTime(issue.createdAt, { dateStyle: "medium", timeStyle: undefined })}</td>
                    <td>
                      <div className="admin-action">
                        <button
                          className="button button--secondary"
                          type="button"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          {t("admin.viewDetails")}
                        </button>
                        <select
                          value={draftStatusById[issue.id] ?? issue.status}
                          onChange={(event) => {
                            const nextStatus = event.target.value as CivicIssueStatus;
                            setDraftStatusById((current) => ({ ...current, [issue.id]: nextStatus }));
                          }}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {translateStatus(status)}
                            </option>
                          ))}
                        </select>
                        <button
                          className="button button--primary"
                          type="button"
                          onClick={() => {
                            void updateIssueStatus(issue.id);
                          }}
                          disabled={savingId === issue.id || draftStatusById[issue.id] === issue.status}
                        >
                          {savingId === issue.id ? t("admin.saving") : t("admin.save")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && filteredIssues.length === 0 ? (
            <div className="state-card admin-empty">{t("admin.noMatches")}</div>
          ) : null}
        </section>
      ) : null}

      <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </section>
  );
}
