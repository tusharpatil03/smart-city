import { NavLink } from "react-router-dom";
import { useI18n } from "../i18n";

export function Navbar() {
  const { language, setLanguage, t } = useI18n();

  const navItems = [
    { to: "/", label: t("navbar.map") },
    { to: "/issues", label: t("navbar.issues") }
  ];

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink to="/" className="brand" end>
          <span className="brand__icon">📍</span>
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

        <NavLink to="/report" className="top-nav__cta">
          {t("navbar.reportIssue")}
        </NavLink>
      </div>
    </header>
  );
}
