import { Navbar } from "./components/Navbar";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main app-main--civic">
        <AppRoutes />
      </main>
    </div>
  );
}
