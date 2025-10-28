import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const isAdmin = !!(user && user.is_admin);

  if (!token || !isAdmin) {
    return <Navigate to="/AdminPanel" replace />;
  }

  return children;
}
