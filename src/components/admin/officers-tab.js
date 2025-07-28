import * as React from "react";
import Paper from "@mui/material/Paper";
import "../admin/css/style.css";
import nairaIcon from "../../pictures/agent_tag.png";
import {
  MDBBtn,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBIcon,
  MDBInput,
  MDBRow,
} from "mdb-react-ui-kit";

import { useEffect } from "react";
import { useState } from "react";
import request from "superagent";
import TextInput from "../textField.js";
import { loader } from "../LoadingSpinner.js";
import Swal from "sweetalert2";
import { Toast } from "../errorNotifier.js";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import StudentsAffairsTab from "./officers-tabs/students-affairs.js";
import HODSTab from "./officers-tabs/hods.js";
import RegistrarTab from "./officers-tabs/registrar.js";

export default function OfficersTab() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [init, setInit] = useState(false);
  const [value, setValue] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const officerRole = localStorage.getItem("officeRole");

  const handleFetchData = async () => {
    if (isReady) {
      return;
    }
    // if (rows.length > 0) return; // Prevents unnecessary fetches

    try {
      await request
        .get(
          "https://api.mcchstfuntua.edu.ng/clearance/sao/uncleared/index.php"
        )
        .type("application/json")
        .then((response) => {
          console.log("FETCH RES: ", response.body);
          setIsReady(true);
          setRows(response.body);
        });
    } catch (err) {
      // console.log(err);
    }
  };

  // Define which tabs each role can access
  const roleAccess = {
    hod: [0], // HOD can only access HOD tab
    sao: [1], // Student Affairs Officer can only access SAO tab
    registrar: [2], // Registrar can only access Registrar tab
  };

  // Get allowed tabs for current role
  const allowedTabs = roleAccess[officerRole] || [];

  useEffect(() => {
    // Set initial tab value based on role
    if (!init) {
      switch (officerRole) {
        case "hod":
          setValue(0);
          break;
        case "sao":
          setValue(1);
          break;
        case "registrar":
          setValue(2);
          break;
        default:
          Toast.fire({
            icon: "info",
            title: "Unauthorized Access",
            text: "You don't have permission to access this section.",
          });
      }
      setInit(true);
    }
  }, [init, officerRole, navigate]);

  // Only allow switching to permitted tabs
  const handleChange = (event, newValue) => {
    if (allowedTabs.includes(newValue)) {
      setValue(newValue);
    }
  };

  // Render only the tabs the user has access to
  const renderTabs = () => {
    const tabs = [];
    if (allowedTabs.includes(0)) {
      tabs.push(<Tab key="hod" label="HOD" {...a11yProps(0)} />);
    }
    if (allowedTabs.includes(1)) {
      tabs.push(<Tab key="sao" label="Students Affairs" {...a11yProps(1)} />);
    }
    if (allowedTabs.includes(2)) {
      tabs.push(<Tab key="registrar" label="Registrar" {...a11yProps(2)} />);
    }
    return tabs;
  };

  // Render only the panels the user has access to
  const renderPanels = () => {
    const panels = [];
    if (allowedTabs.includes(0)) {
      panels.push(
        <TabPanel key="hod" value={value} index={0}>
          <HODSTab />
        </TabPanel>
      );
    }
    if (allowedTabs.includes(1)) {
      panels.push(
        <TabPanel key="sao" value={value} index={1}>
          <StudentsAffairsTab />
        </TabPanel>
      );
    }
    if (allowedTabs.includes(2)) {
      panels.push(
        <TabPanel key="registrar" value={value} index={2}>
          <RegistrarTab />
        </TabPanel>
      );
    }
    return panels;
  };

  // If no valid role, show unauthorized message
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

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow>
          <MDBCol>
            <div>
              <Box sx={{ width: "100%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="officers tabs"
                  >
                    {renderTabs()}
                  </Tabs>
                </Box>
                {renderPanels()}
              </Box>
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
}
