import { useEffect, useMemo, useState } from "react";
import { IssueCard } from "../components/IssueCard";
import { IssueDetailModal } from "../components/IssueDetailModal";
import { useI18n } from "../i18n";
import { civicApi } from "../services/api";
import type {
  CivicIssue,
  CivicIssueCategory,
  CivicIssueStatus,
  VoteType
} from "../services/api";

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
  const { t, translateCategory, translateStatus } = useI18n();
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CivicIssueStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<CivicIssueCategory | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [votingIssueIds, setVotingIssueIds] = useState<string[]>([]);

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

        setError(err instanceof Error ? err.message : t("errors.loadIssues"));
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [t]);

  const applyOptimisticVote = (issue: CivicIssue, nextType: VoteType): CivicIssue => {
    const previousVote = issue.currentUserVote;

    if (previousVote === nextType) {
      const nextUpvotes = nextType === "upvote" ? Math.max(0, issue.upvotes - 1) : issue.upvotes;
      const nextDownvotes =
        nextType === "downvote" ? Math.max(0, issue.downvotes - 1) : issue.downvotes;

      return {
        ...issue,
        upvotes: nextUpvotes,
        downvotes: nextDownvotes,
        netScore: nextUpvotes - nextDownvotes,
        currentUserVote: null
      };
    }

    const nextUpvotes =
      nextType === "upvote"
        ? issue.upvotes + 1
        : previousVote === "upvote"
          ? Math.max(0, issue.upvotes - 1)
          : issue.upvotes;

    const nextDownvotes =
      nextType === "downvote"
        ? issue.downvotes + 1
        : previousVote === "downvote"
          ? Math.max(0, issue.downvotes - 1)
          : issue.downvotes;

    return {
      ...issue,
      upvotes: nextUpvotes,
      downvotes: nextDownvotes,
      netScore: nextUpvotes - nextDownvotes,
      currentUserVote: nextType
    };
  };

  const handleVote = async (issue: CivicIssue, type: VoteType): Promise<void> => {
    if (votingIssueIds.includes(issue.id)) {
      return;
    }

    const optimisticIssue = applyOptimisticVote(issue, type);

    setVotingIssueIds((current) => [...current, issue.id]);
    setIssues((currentIssues) =>
      currentIssues.map((currentIssue) =>
        currentIssue.id === issue.id ? optimisticIssue : currentIssue
      )
    );

    try {
      const updatedIssue = await civicApi.voteIssue(issue.id, type);
      setIssues((currentIssues) =>
        currentIssues.map((currentIssue) =>
          currentIssue.id === issue.id ? updatedIssue : currentIssue
        )
      );
      setError(null);
    } catch (err) {
      setIssues((currentIssues) =>
        currentIssues.map((currentIssue) =>
          currentIssue.id === issue.id ? issue : currentIssue
        )
      );
      setError(err instanceof Error ? err.message : t("errors.loadIssues"));
    } finally {
      setVotingIssueIds((current) => current.filter((issueId) => issueId !== issue.id));
    }
  };

  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        const normalizedSearch = searchQuery.trim().toLowerCase();
        const matchesSearch =
          normalizedSearch.length === 0 ||
          issue.title.toLowerCase().includes(normalizedSearch) ||
          issue.description.toLowerCase().includes(normalizedSearch) ||
          issue.category.toLowerCase().includes(normalizedSearch);

        const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
        const matchesCategory = categoryFilter === "All" || issue.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((left, right) => {
        if (right.netScore !== left.netScore) {
          return right.netScore - left.netScore;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });
  }, [issues, searchQuery, statusFilter, categoryFilter]);

  return (
    <section className="civic-page civic-page--subtle">
      <header className="issues-header">
        <div>
          <h1>{t("issueList.title")}</h1>
          <p>
            {t("issueList.resultCount", { visible: filteredIssues.length, total: issues.length })}
          </p>
        </div>
        <button
          className={`filter-toggle ${showFilters ? "filter-toggle--active" : ""}`}
          type="button"
          onClick={() => setShowFilters((value) => !value)}
        >
          {t("issueList.filter")}
        </button>
      </header>

      <div className="issues-search-wrap">
        <input
          type="search"
          value={searchQuery}
          placeholder={t("issueList.searchPlaceholder")}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {showFilters ? (
        <section className="filter-panel">
          <div>
            <p>{t("issueList.status")}</p>
            <div className="filter-row">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={statusFilter === status ? "active" : ""}
                  onClick={() => setStatusFilter(status)}
                >
                  {translateStatus(status)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p>{t("issueList.category")}</p>
            <div className="filter-row">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={categoryFilter === category ? "active" : ""}
                  onClick={() => setCategoryFilter(category)}
                >
                  {translateCategory(category)}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {loading ? <div className="state-card">{t("common.loadingIssues")}</div> : null}
      {error ? <div className="alert alert--error">{error}</div> : null}

      {!loading && !error && filteredIssues.length === 0 ? (
        <div className="state-card">
          <h2>{t("issueList.noIssuesFound")}</h2>
          <p>{t("issueList.adjustFilters")}</p>
        </div>
      ) : null}

      <div className="cards-grid cards-grid--three">
        {filteredIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={(item) => setSelectedIssue(item)}
            onVote={(item, type) => {
              void handleVote(item, type);
            }}
            isVoting={votingIssueIds.includes(issue.id)}
          />
        ))}
      </div>

      <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </section>
  );
}
