import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { UserDb } from "../models/types";

const roleRouteAccess: Record<UserDb["role"], string[]> = {
  admin: [
    "/dashboard",
    "/modules",
    "/factures",
    "/users",
    "/contracts",
    "/parametres",
    "/transactions",
    "/companies",
    "/ads",
  ],
  owner: [
    "/dashboard",
    "/modules",
    "/factures",
    "/users",
    "/contracts",
    "/parametres",
    "/transactions",
    "/companies",
    "/ads",
  ],
  manager: [
    "/dashboard",
    "/modules",
    "/factures",
    "/contracts",
    "/parametres",
    "/transactions",
  ],
  advertiser: ["/dashboard", "/factures", "/ads", "/contracts", "/parametres"],
  client: [
    "/dashboard",
    "/modules",
    "/factures",
    "/contracts",
    "/parametres",
    "/transactions",
  ],
};

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user && !loading) {
    return <Navigate to="/login" />;
  }

  if (!user) {
    return;
  }

  // Get the base path (first level)
  const currentPath = "/" + location.pathname.split("/")[1];

  // Check if user has access to this route
  const hasAccess = roleRouteAccess[user.role]?.includes(currentPath);

  if (!hasAccess) {
    // Redirect to dashboard if user doesn't have access
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
