import { Link } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-header__eyebrow">Smart City</p>
          <h1 className="app-header__title">Issue reporting workspace</h1>
        </div>

        <nav className="app-nav" aria-label="Primary">
          <Link to="/">Issues</Link>
          <Link to="/create">Create</Link>
        </nav>
      </header>

      <main className="app-main">
        <AppRoutes />
      </main>
    </div>
  );
}
