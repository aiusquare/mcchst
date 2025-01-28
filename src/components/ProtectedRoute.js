import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const lastActivityTime = localStorage.getItem("lastActivityTime");

  const timeRemaining = calculateTimeRemaining(lastActivityTime);

  // console.log("TIME REMAINING", timeRemaining);

  if (timeRemaining !== 0) {
    return children;
  } else {
    return <Navigate to={"/login"} replace />;
  }
};

const calculateTimeRemaining = (lastActivityTime) => {
  const now = Date.now();
  const lastActivity = lastActivityTime ? parseInt(lastActivityTime, 10) : now;
  const elapsed = now - lastActivity;
  const timeRemaining = 30 * 60 * 1000 - elapsed; // 30 minutes in milliseconds

  return timeRemaining > 0 ? timeRemaining : 0;
};

export default ProtectedRoute;
