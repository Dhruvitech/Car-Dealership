import { Navigate, Outlet } from "react-router-dom";

/**
 * ProtectedRoute Component
 * Placeholder guard for protected pages (Dashboard, Admin, etc.)
 * Note: Authentication logic will be attached in future phase.
 */
export default function ProtectedRoute({ children, redirectPath = "/login" }) {
  // Placeholder: set to true to allow access during structure setup
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
}
