import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Signup from "../views/auth/Signup";
import Dashboard from "../views/dashboard/Dashboard";
import ProjectDetailView from "../views/dashboard/components/ProjectDetailView";

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/*     <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />
 */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/projects" element={<Dashboard />} />

      <Route path="/projects/:id" element={<ProjectDetailView />} />

      <Route path="/signup" element={<Signup />} />

      {/*    <Route element={<ProtectedRoute />}>
        {router.map((route, i) => (
          <Route path={route.path} element={route.component} key={i} />
        ))}
      </Route> */}
    </Routes>
  );
};

export default AppRoutes;
