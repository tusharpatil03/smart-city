import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AdminPanelPage } from "../pages/AdminPanelPage";
import { AuthorityLoginPage } from "../pages/AuthorityLoginPage";
import { AuthorityRegisterPage } from "../pages/AuthorityRegisterPage";
import { CreateIssuePage } from "../pages/CreateIssuePage";
import { IssueDetailPage } from "../pages/IssueDetailPage";
import { IssueListPage } from "../pages/IssueListPage";
import { HomePage } from "../pages/HomePage";
import { ProfilePage } from "../pages/ProfilePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPanelPage />
          </ProtectedRoute>
        }
      />
      <Route path="/issues" element={<IssueListPage />} />
      <Route path="/report" element={<CreateIssuePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/authority/login" element={<AuthorityLoginPage />} />
      <Route path="/authority/register" element={<AuthorityRegisterPage />} />
      <Route path="/issues/:id" element={<IssueDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
