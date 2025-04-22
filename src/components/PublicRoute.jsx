import React from "react";
import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("user");

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

export default PublicRoute;
