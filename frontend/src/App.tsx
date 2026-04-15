import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Navbar } from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import { useI18n } from "./i18n";
import { AppRoutes } from "./routes/AppRoutes";
import { socket } from "./services/socket";

export default function App() {
  const { user } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    socket.emit("register", user.id);

    const handleIssueCreated = (data: { message?: string }) => {
      toast.success(data.message ?? t("toast.issueSubmitted"), {
        position: "top-right",
        autoClose: 3000
      });
    };

    socket.on("issueCreated", handleIssueCreated);

    return () => {
      socket.off("issueCreated", handleIssueCreated);
    };
  }, [t, user?.id]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main app-main--civic">
        <AppRoutes />
      </main>
      <ToastContainer />
    </div>
  );
}
