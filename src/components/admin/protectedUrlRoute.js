import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toast } from "../errorNotifier";
import { accessRules } from "../Arrays";
import {
  getStoredAdditionalPages,
  isAdditionalPageAllowed,
} from "../../utils/access-control";

const ACCOUNT_OFFICER_ROLES = ["accounting", "account-officer"];

const isAccountOfficerRole = (role) => ACCOUNT_OFFICER_ROLES.includes(role);

const isPathAllowed = (access, path) => {
  if (!access || !accessRules[access]) return false;
  return accessRules[access].some((allowedPath) => path.startsWith(allowedPath));
};

const ProtectedUrlRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userAccess = localStorage.getItem("access");
  const [hasAccess, setHasAccess] = useState(null); // null means loading state

  useEffect(() => {
    const officerRole = localStorage.getItem("officeRole");
    const isSiteAdmin = userAccess === "siteAdmin";
    const isAccountOfficer =
      userAccess === "accounting" ||
      (userAccess === "officer" && isAccountOfficerRole(officerRole));
    const isOfficer =
      officerRole &&
      !isAccountOfficerRole(officerRole) &&
      location.pathname === "/admin/officers";
    const hasAdditionalPageAccess = isAdditionalPageAllowed(
      getStoredAdditionalPages(),
      location.pathname
    );
    const allowed =
      isSiteAdmin ||
      hasAdditionalPageAccess ||
      (isAccountOfficer
        ? isPathAllowed("accounting", location.pathname)
        : isPathAllowed(userAccess, location.pathname) || isOfficer);

    const passwordSetup = localStorage.getItem("password_setup");
    if (passwordSetup === "no") {
      setHasAccess(true);
      navigate("/admin/create-password");
      return;
    }

    if (!allowed) {
      Toast.fire({
        icon: "error",
        title: "You have restrictive access.",
      });
      setHasAccess(false);
      return;
    }

    setHasAccess(true);
  }, [userAccess, location.pathname, navigate]);

  const handleBack = () => {
    navigate(-1); // Go to previous page
  };

  if (hasAccess === null) {
    return null; // or <Loader /> if you have one
  }

  return hasAccess ? (
    children
  ) : (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h2 style={{ color: "crimson", marginBottom: "20px" }} role="alert">
        Access Denied
      </h2>
      <p style={{ fontSize: "16px", marginBottom: "20px" }}>
        You don't have access to this page.
      </p>
      <button
        onClick={handleBack}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Go Back
      </button>
    </main>
  );
};

export default ProtectedUrlRoute;
