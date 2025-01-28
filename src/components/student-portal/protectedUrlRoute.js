import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedUrlRoute = ({ children }) => {
  const location = useLocation();
  const userAccess = localStorage.getItem("access"); // e.g., "application", "finance", "siteAdmin"

  const initPath = location.pathname;

  const isSiteAdmin = userAccess === "siteAdmin";

  // Define the access rules: each access right is associated with certain paths
  const accessRules = {
    application: ["/admin/application"],
    finance: ["/admin/finance"],
    users: ["/admin/users", "/admin/create-staff"],
    siteAdmin: [
      "/admin",
      "/admin/application",
      "/admin/finance",
      "/admin/users",
      "/admin/create-staff",
      "/admin/settings",
    ],
  };

  // Function to check if the current path is allowed for the user's access right
  const isPathAllowed = (access, path) => {
    return accessRules[access]?.some((allowedPath) =>
      path.startsWith(allowedPath)
    );
  };

  // If the user has the appropriate access or is a siteAdmin, render the children
  if (isSiteAdmin || isPathAllowed(userAccess, initPath)) {
    return children;
  } else {
    // Otherwise, redirect to the login page
    return <Navigate to="/admin-login" replace />;
  }
};

export default ProtectedUrlRoute;
