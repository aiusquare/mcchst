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

  useEffect(() => {
    if (!init) {
      // handleFetchData();

      if (officerRole === "hod") {
        setValue(0);
      } else if (officerRole === "sao") {
        setValue(1);
      } else if (officerRole === "ao") {
        setValue(2);
      } else if (officerRole === "bursar") {
        setValue(3);
      } else if (officerRole === "registrar") {
        setValue(4);
      }
    }
  }, [init]);

  const vals = ["1", "2", "3", "4"];

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
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
      id: `vertical-tab-${index}`,
      "aria-controls": `vertical-tabpanel-${index}`,
    };
  }

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow>
          <MDBCol>
            <div>
              {value === 0 && <HODSTab />}
              {value === 1 && <StudentsAffairsTab />}
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
}
