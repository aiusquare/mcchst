import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Box, Tabs, Tab, Typography } from "@mui/material";
import { MDBRow, MDBCol } from "mdb-react-ui-kit";
import { Toast } from "../../components/errorNotifier";
import HODPanel from "./components/HODPanel";
import StudentAffairsPanel from "./components/StudentAffairsPanel";
import RegistrarPanel from "./components/RegistrarPanel";
import TabPanel from "./components/TabPanel";

const OFFICER_ROLES = {
  HOD: "hod",
  SAO: "sao",
  REGISTRAR: "registrar",
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

  const handleTabChange = (event, newValue) => {
    if (allowedTabs.includes(newValue)) {
      setActiveTab(newValue);
    }
  };

  const getTabProps = (index) => ({
    id: `officer-tab-${index}`,
    "aria-controls": `officer-tabpanel-${index}`,
  });

  // Render tabs based on user role
  const renderTabs = () => {
    const tabs = [];
    if (allowedTabs.includes(0)) {
      tabs.push(<Tab key="hod" label="HOD" {...getTabProps(0)} />);
    }
    if (allowedTabs.includes(1)) {
      tabs.push(<Tab key="sao" label="Students Affairs" {...getTabProps(1)} />);
    }
    if (allowedTabs.includes(2)) {
      tabs.push(<Tab key="registrar" label="Registrar" {...getTabProps(2)} />);
    }
    return tabs;
  };

  // Render panels based on user role
  const renderPanels = () => {
    const panels = [];
    if (allowedTabs.includes(0)) {
      panels.push(
        <TabPanel key="hod" value={activeTab} index={0}>
          <HODPanel />
        </TabPanel>
      );
    }
    if (allowedTabs.includes(1)) {
      panels.push(
        <TabPanel key="sao" value={activeTab} index={1}>
          <StudentAffairsPanel />
        </TabPanel>
      );
    }
    if (allowedTabs.includes(2)) {
      panels.push(
        <TabPanel key="registrar" value={activeTab} index={2}>
          <RegistrarPanel />
        </TabPanel>
      );
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
          <MDBCol>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  aria-label="officer tabs"
                >
                  {renderTabs()}
                </Tabs>
              </Box>
              {renderPanels()}
            </Box>
          </MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
};

export default Officers;
