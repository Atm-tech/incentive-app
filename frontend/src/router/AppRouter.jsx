import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import AdminDashboard from "../pages/admin/AdminDashboard";
import RequireAuth from "../auth/requireAuth";

// Salesman screens
import SalesmanLanding from "../pages/salesman/SalesmanLanding";
import ProfilePage from "../pages/salesman/ProfilePage";
import SalesPage from "../pages/salesman/SalesPage";

// Role-aware protected route
function RequireRole({ role, children }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" />;
  if (userRole !== role) return <Navigate to="/" />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Admin - mounted as layout (subroutes inside) */}
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          }
        />

        {/* Salesman Pages */}
        <Route
          path="/salesman"
          element={
            <RequireRole role="salesman">
              <SalesmanLanding />
            </RequireRole>
          }
        />
        <Route
          path="/salesman/profile"
          element={
            <RequireRole role="salesman">
              <ProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="/salesman/sales"
          element={
            <RequireRole role="salesman">
              <SalesPage />
            </RequireRole>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
