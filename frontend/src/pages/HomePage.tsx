import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IssueCard } from "../components/IssueCard";
import { IssueDetailModal } from "../components/IssueDetailModal";
import { useI18n } from "../i18n";
import { MapView } from "../components/MapView";
import { civicApi, type CivicIssue, type VoteType } from "../services/api";

export function HomePage() {
  const { t } = useI18n();
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const stats = {
    total: issues.length,
    reported: issues.filter((issue) => issue.status === "Reported").length,
    inProgress: issues.filter((issue) => issue.status === "In Progress").length,
    resolved: issues.filter((issue) => issue.status === "Resolved").length
  };

  const statCards = [
    {
      label: t("home.totalIssues"),
      value: stats.total,
      tone: "total",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H17.5L20 6.5V17.5A2.5 2.5 0 0 1 17.5 20H6.5A2.5 2.5 0 0 1 4 17.5V6.5Z" />
          <path d="M8 8.5H16" />
          <path d="M8 12H16" />
          <path d="M8 15.5H13" />
        </svg>
      )
    },
    {
      label: t("home.pending"),
      value: stats.inProgress,
      tone: "pending",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7.5" />
          <path d="M12 7.5V12l3 1.8" />
        </svg>
      )
    },
    {
      label: t("home.reported"),
      value: stats.reported,
      tone: "reported",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 4h2v16h-2z" />
          <path d="M12 5.5c2.5 0 4 1.2 6 1.2v5c-2 0-3.5-1.2-6-1.2s-4 1.2-6 1.2v-5c2 0 3.5-1.2 6-1.2Z" />
        </svg>
      )
    },
    {
      label: t("home.resolved"),
      value: stats.resolved,
      tone: "resolved",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7.5" />
          <path d="M8.8 12.4 11 14.6 15.4 10.2" />
        </svg>
      )
    }
  ];

  return (
    <section className="civic-page">
      <section className="hero">
        <div className="hero__noise" aria-hidden="true" />
        <div className="hero__content">
          <p className="hero__chip">{t("home.heroTracked", { count: stats.total })}</p>
          <h1>
            {t("home.heroTitleLine1")}
            <br />
            <span>{t("home.heroTitleLine2")}</span>
          </h1>
          <p>{t("home.heroDescription")}</p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/report">
              {t("home.reportIssue")}
            </Link>
            <Link className="button button--ghost" to="/issues">
              {t("home.browseIssues")}
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label={t("home.issueStatsAria")}>
        {statCards.map((stat) => (
          <article key={stat.label} className="stat-card">
            <div className={`stat-card__header stat-card__header--${stat.tone}`}>
              <span className="stat-card__icon">{stat.icon}</span>
              <p>{stat.label}</p>
            </div>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="panel">
        <header className="panel__header">
          <h2>{t("home.liveIssueMap")}</h2>
        </header>
        <div className="panel__map">
          {loading ? <div className="state-card">{t("common.loadingMap")}</div> : null}
          {!loading ? (
            <MapView issues={issues} showCurrentLocation onMarkerClick={(issue) => setSelectedIssue(issue)} />
          ) : null}
        </div>
      </section>

      <section className="recent-section">
        <header className="recent-section__header">
          <h2>{t("home.recentIssues")}</h2>
          <Link to="/issues">{t("home.viewAll")}</Link>
        </header>

        {error ? <div className="alert alert--error">{error}</div> : null}

        <div className="cards-grid">
          {issues.slice(0, 3).map((issue) => (
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
      </section>

      <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </section>
  );
}
