import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Tab, Typography } from "@mui/material";
import { MDBRow, MDBCol } from "mdb-react-ui-kit";
import { Toast } from "../../components/errorNotifier";
import StudentAffairsPanel from "./components/StudentAffairsPanel";
import RegistrarPanel from "./components/RegistrarPanel";
import HODTabs from "./hod/HODTabs";

const OFFICER_ROLES = {
  HOD: "hod",
  SAO: "sao",
  REGISTRAR: "registerer",
};

const ROLE_ACCESS = {
  [OFFICER_ROLES.HOD]: [0],
  [OFFICER_ROLES.SAO]: [1],
  [OFFICER_ROLES.REGISTRAR]: [2],
};

const Officers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const officerRole = localStorage.getItem("officeRole");
  const allowedTabs = ROLE_ACCESS[officerRole] || [];

  console.log("Officer Role:", officerRole);
  console.log("Allowed Tabs:", allowedTabs);

  useEffect(() => {
    if (!isInitialized) {
      switch (officerRole) {
        case OFFICER_ROLES.HOD:
          setActiveTab(0);
          break;
        case OFFICER_ROLES.SAO:
          setActiveTab(1);
          break;
        case OFFICER_ROLES.REGISTRAR:
          setActiveTab(2);
          break;
        default:
          Toast.fire({
            icon: "info",
            title: "Unauthorized Access",
            text: "You don't have permission to access this section.",
          });
      }
      setIsInitialized(true);
    }
  }, [isInitialized, officerRole]);

  // Render panels based on user role
  const renderPanels = () => {
    const panels = [];
    if (allowedTabs.includes(0)) {
      panels.push(<HODTabs />);
    }
    if (allowedTabs.includes(1)) {
      panels.push(<StudentAffairsPanel />);
    }
    if (allowedTabs.includes(2)) {
      panels.push(<RegistrarPanel />);
    }
    return panels;
  };

  if (!allowedTabs.length) {
    return (
      <div className="m-4 d-flex flex-column align-items-center">
        <Paper sx={{ width: "100%", overflow: "hidden", p: 3 }}>
          <Typography variant="h5" component="h2">
            Unauthorized Access
          </Typography>
          <Typography>
            You don't have permission to access this section.
          </Typography>
        </Paper>
      </div>
    );
  }

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow>
          <MDBCol>{renderPanels()}</MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
};

export default Officers;
