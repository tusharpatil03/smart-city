import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import logoImg from "../../logo (3).png";
import { ProfileMenu } from "./ProfileMenu";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="top-nav__bell-icon">
      <path d="M15 17h4l-1.2-1.2A2 2 0 0 1 17 14.4V11a5 5 0 0 0-10 0v3.4c0 .5-.2 1-.8 1.4L5 17h4" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

export function Navbar() {
  const { language, setLanguage, t } = useI18n();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { to: "/", label: t("navbar.map") },
    { to: "/issues", label: t("navbar.issues") }
  ];

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink to="/" className="brand" end>
          <span className="brand__icon">
            <img src={logoImg} alt="Civic Issue Tracker Logo" className="brand__logo" />
          </span>
          <span className="brand__text">{t("navbar.brand")}</span>
        </NavLink>

        <nav className="top-nav__links" aria-label={t("navbar.primary")}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `top-nav__link ${isActive ? "top-nav__link--active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="top-nav__actions">
          <label className="top-nav__language">
            <span>{t("navbar.language")}</span>
            <select
              value={language}
              onChange={(event) => {
                const nextLanguage = event.target.value;

                if (nextLanguage === "en" || nextLanguage === "hi" || nextLanguage === "mr") {
                  setLanguage(nextLanguage);
                }
              }}
            >
              <option value="en">{t("navbar.languageEnglish")}</option>
              <option value="hi">{t("navbar.languageHindi")}</option>
              <option value="mr">{t("navbar.languageMarathi")}</option>
            </select>
          </label>

          <button type="button" className="top-nav__icon-btn" aria-label={t("navbar.notificationsAria")}>
            <BellIcon />
            <span className="top-nav__icon-dot" aria-hidden="true" />
          </button>

          {isAuthenticated ? <ProfileMenu /> : null}

          {!isAuthenticated ? (
            <NavLink to="/authority/login" className="top-nav__auth-btn top-nav__auth-btn--link">
              {t("auth.authorityLogin")}
            </NavLink>
          ) : null}

          <NavLink to="/report" className="top-nav__cta">
            {t("navbar.reportIssue")}
          </NavLink>
        </div>
      </div>
    </header>
  );
}
