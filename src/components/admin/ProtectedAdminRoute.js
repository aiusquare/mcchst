import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const lastActivityTime = localStorage.getItem("adminLogin");
  const timeRemaining = calculateTimeRemaining(lastActivityTime);

  if (timeRemaining !== 0 && lastActivityTime !== null) {
    return children;
  } else {
    return <Navigate to={"/admin-login"} replace />;
  }
};

const calculateTimeRemaining = (lastActivityTime) => {
  const now = Date.now();
  const lastActivity = lastActivityTime ? parseInt(lastActivityTime, 10) : now;
  const elapsed = now - lastActivity;
  const timeRemaining = 30 * 60 * 1000 - elapsed; // 30 minutes in milliseconds

  return timeRemaining > 0 ? timeRemaining : 0;
};

export default ProtectedAdminRoute;
