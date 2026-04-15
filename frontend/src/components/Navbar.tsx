import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Map" },
  { to: "/issues", label: "Issues" }
];

export function Navbar() {
  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink to="/" className="brand" end>
          <span className="brand__icon">📍</span>
          <span className="brand__text">Civic Issue Tracker</span>
        </NavLink>

        <nav className="top-nav__links" aria-label="Primary">
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

        <NavLink to="/report" className="top-nav__cta">
          + Report Issue
        </NavLink>
      </div>
    </header>
  );
}
