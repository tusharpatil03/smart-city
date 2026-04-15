import { useEffect, useMemo, useState } from "react";
import { IssueCard } from "../components/IssueCard";
import { IssueDetailModal } from "../components/IssueDetailModal";
import { civicApi } from "../services/api";
import type { CivicIssue, CivicIssueCategory, CivicIssueStatus } from "../services/api";

const STATUS_OPTIONS: Array<CivicIssueStatus | "All"> = [
  "All",
  "Reported",
  "In Progress",
  "Resolved"
];

const CATEGORY_OPTIONS: Array<CivicIssueCategory | "All"> = [
  "All",
  "Pothole",
  "Garbage",
  "Streetlight",
  "Flooding",
  "Graffiti",
  "Road Damage",
  "Other"
];

export function IssueListPage() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CivicIssueStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<CivicIssueCategory | "All">("All");
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const normalizedSearch = searchQuery.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        issue.title.toLowerCase().includes(normalizedSearch) ||
        issue.description.toLowerCase().includes(normalizedSearch) ||
        issue.category.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
      const matchesCategory = categoryFilter === "All" || issue.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [issues, searchQuery, statusFilter, categoryFilter]);

  return (
    <section className="civic-page civic-page--subtle">
      <header className="issues-header">
        <div>
          <h1>All Issues</h1>
          <p>
            {filteredIssues.length} of {issues.length} issues
          </p>
        </div>
        <button
          className={`filter-toggle ${showFilters ? "filter-toggle--active" : ""}`}
          type="button"
          onClick={() => setShowFilters((value) => !value)}
        >
          Filter
        </button>
      </header>

      <div className="issues-search-wrap">
        <input
          type="search"
          value={searchQuery}
          placeholder="Search issues..."
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {showFilters ? (
        <section className="filter-panel">
          <div>
            <p>Status</p>
            <div className="filter-row">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={statusFilter === status ? "active" : ""}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p>Category</p>
            <div className="filter-row">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={categoryFilter === category ? "active" : ""}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {loading ? <div className="state-card">Loading issues...</div> : null}
      {error ? <div className="alert alert--error">{error}</div> : null}

      {!loading && !error && filteredIssues.length === 0 ? (
        <div className="state-card">
          <h2>No issues found</h2>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : null}

      <div className="cards-grid cards-grid--three">
        {filteredIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onClick={(item) => setSelectedIssue(item)} />
        ))}
      </div>

      <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </section>
  );
}
