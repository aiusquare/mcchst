import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ userData }) => {
  if (userData) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
