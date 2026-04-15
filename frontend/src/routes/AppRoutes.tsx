import { Navigate, Route, Routes } from "react-router-dom";
import { AdminPanelPage } from "../pages/AdminPanelPage";
import { CreateIssuePage } from "../pages/CreateIssuePage";
import { IssueDetailPage } from "../pages/IssueDetailPage";
import { IssueListPage } from "../pages/IssueListPage";
import { HomePage } from "../pages/HomePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPanelPage />} />
      <Route path="/issues" element={<IssueListPage />} />
      <Route path="/report" element={<CreateIssuePage />} />
      <Route path="/issues/:id" element={<IssueDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
