import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  if (!user) {
    return <Navigate to="/authority/login" replace />;
  }

  return (
    <section className="profile-page">
      <header className="profile-page__hero">
        <p className="profile-page__eyebrow">{t("navbar.myProfile")}</p>
        <h1>{user.name}</h1>
        <p>{t("profile.subtitle")}</p>
      </header>

      <div className="profile-page__grid">
        <article className="profile-page__card">
          <p className="profile-page__label">{t("profile.name")}</p>
          <strong>{user.name}</strong>
        </article>

        <article className="profile-page__card">
          <p className="profile-page__label">{t("profile.email")}</p>
          <strong>{user.email}</strong>
        </article>

        <article className="profile-page__card">
          <p className="profile-page__label">{t("profile.role")}</p>
          <strong>{user.role}</strong>
        </article>
      </div>

      <div className="profile-page__actions">
        <Link to="/issues" className="button button--secondary">
          {t("profile.backToIssues")}
        </Link>
        <button type="button" className="button button--primary" onClick={logout}>
          {t("auth.logout")}
        </button>
      </div>
    </section>
  );
}