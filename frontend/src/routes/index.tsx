import React from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";
import { MainLayout } from "../components/layout";
import AuthLayout from "../components/layout/AuthLayout";

// Auth pages (named exports)
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { OnboardingPage } from "../features/auth/OnboardingPage";
import { SettingsPage } from "../features/auth/SettingsPage";

// Public pages
import HomePage from "../features/home/HomePage";
import PublicLayout from "../components/layout/PublicLayout";

// Feature pages (default exports)
import DashboardPage from "../features/dashboard/DashboardPage";
import EventListPage from "../features/events/EventListPage";
import EventDetailPage from "../features/events/EventDetailPage";
import ArchivedEventsPage from "../features/events/ArchivedEventsPage";
import FavoritesListPage from "../features/favorites/FavoritesListPage";
import ObservationTimeline from "../features/observations/ObservationTimeline";
import ObservationForm from "../features/observations/ObservationForm";
import ExportHistory from "../features/export/ExportHistory";
import ExportPreviewComponent from "../features/export/ExportPreview";
import BrandingSettings from "../features/export/BrandingSettings";
import EventExportPage from "../features/export/EventExportPage";
import AdminRoute from "../features/admin/AdminRoute";
import AdminPanelPage from "../features/admin/AdminPanelPage";
import AnalyticsDashboard from "../features/analytics/AnalyticsDashboard";

// ---- Route wrapper for ExportPreview (prop-based component) ----

function ExportPreviewPage() {
  const { id } = useParams<{ id: string }>();
  return <ExportPreviewComponent exportId={id || ""} />;
}

// ---- Protected route wrapper ----

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } catch {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// ---- Auth layout wrapper (dark theme + bottom nav) ----

const AuthLayoutWrapper: React.FC = () => (
  <AuthLayout>
    <Outlet />
  </AuthLayout>
);

// ---- Admin layout wrapper (MainLayout for admin pages) ----

const AdminLayoutWrapper: React.FC = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

// ---- Router ----

const router = createBrowserRouter([
  // Public home page
  {
    path: "/",
    element: (
      <PublicLayout>
        <HomePage />
      </PublicLayout>
    ),
  },
  // Auth pages (no layout)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/onboarding",
    element: <OnboardingPage />,
  },
  // Authenticated routes with AuthLayout (dark theme + bottom nav)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthLayoutWrapper />,
        children: [
          { path: "/events", element: <EventListPage /> },
          { path: "/events/archived", element: <ArchivedEventsPage /> },
          { path: "/events/:slug", element: <EventDetailPage /> },
          { path: "/events/:slug/export", element: <EventExportPage /> },
          { path: "/favorites", element: <FavoritesListPage /> },
          { path: "/observations", element: <ObservationTimeline /> },
          { path: "/observations/new", element: <ObservationForm /> },
          { path: "/exports", element: <ExportHistory /> },
          { path: "/exports/:id", element: <ExportPreviewPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/settings/branding", element: <BrandingSettings /> },
        ],
      },
      // Admin routes with MainLayout (dashboard stays as-is)
      {
        element: <AdminLayoutWrapper />,
        children: [
          {
            path: "/dashboard",
            element: (
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            ),
          },
          {
            path: "/admin/*",
            element: (
              <AdminRoute>
                <AdminPanelPage />
              </AdminRoute>
            ),
          },
          { path: "/analytics", element: <AnalyticsDashboard /> },
        ],
      },
    ],
  },
]);

export default router;
