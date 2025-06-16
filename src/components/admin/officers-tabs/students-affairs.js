import * as React from "react";
import Paper from "@mui/material/Paper";
import "../../admin/css/style.css";
import nairaIcon from "../../../pictures/agent_tag.png";
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
import { loader } from "../../LoadingSpinner.js";
import Swal from "sweetalert2";
import { Toast } from "../errorNotifier.js";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Radio } from "@mui/material";
import { CheckBox } from "@mui/icons-material";
import { Checkbox } from "@material-ui/core";

export default function StudentsAffairsTab() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [init, setInit] = useState(false);
  const [value, setValue] = useState(1);
  const [isReady, setIsReady] = useState(false);

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
      handleFetchData();
    }
  }, [init]);

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
      <MDBCardBody>
        <MDBCardText>
          <h4>Students Affairs</h4>
        </MDBCardText>
      </MDBCardBody>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: "background.paper",
              display: "flex",
              // height: 224,
            }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={(e) => {
                console.log("TAB VALUE: ", e);
              }}
              aria-label="Vertical tabs example"
              sx={{ borderRight: 1, borderColor: "divider" }}
            >
              <Tab label="Clearance" />
            </Tabs>

            <div className="d-flex align-items-center">
              <MDBInput
                label="Search"
                // value={resetEmail}
                type="text"
                onChange={(e) => {
                  // setResetEmail(e.target.value);
                }}
                size="lg"
              />

              <MDBBtn
                className="w-25"
                size="lg"
                style={{ background: "#05321e" }}
                // onClick={resetUserPassword}
              >
                Search
              </MDBBtn>
            </div>

            <div style={{ width: "100%", height: "500px", overflow: "scroll" }}>
              <table>
                {rows.map((std, index) => {
                  let hasSubmittedRequirements = false;
                  let hasSubmittedToHOD = false;
                  if (std.SAOFulfiledRegistrationRequirements === "yes") {
                    hasSubmittedRequirements = true;
                  }

                  if (std.SAOConfirmedSubmissionToHOD === "yes") {
                    hasSubmittedToHOD = true;
                  }

                  return (
                    <tr key={std.MatricNumber || index}>
                      <td>
                        <table>
                          <thead>
                            <tr>
                              <th>FullName</th>
                              <th>Mat Number</th>
                              <th>Department</th>
                              <th>Course</th>
                            </tr>
                          </thead>

                          <tbody>
                            <td>
                              <strong>{std.Fullname}</strong>
                            </td>
                            <td>
                              <strong>{std.MatricNumber}</strong>
                            </td>

                            <td>
                              <strong>{std.Department}</strong>
                            </td>
                            <td>
                              <strong>{std.Programme}</strong>
                            </td>
                          </tbody>
                        </table>

                        <div>
                          <Checkbox
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              const updatedRows = [...rows];

                              if (newValue) {
                                updatedRows[
                                  index
                                ].SAOFulfiledRegistrationRequirements = "yes";
                              }
                              setRows(updatedRows);
                            }}
                            checked={hasSubmittedRequirements}
                          />
                          I confirm that the student has submitted all
                          registration requirements.
                        </div>
                        <div>
                          <Checkbox
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              console.log("");
                              const updatedRows = [...rows];

                              if (newValue) {
                                updatedRows[index].SAOConfirmedSubmissionToHOD =
                                  "yes";
                              }
                              setRows(updatedRows);
                            }}
                            checked={hasSubmittedToHOD}
                          />
                          I confirm that i have submitted the student’s
                          departmental file to his HOD.
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <td></td>
              </table>
            </div>
            <MDBBtn
              className="w-50"
              // size="lg"
              style={{ background: "#05321e" }}
              // onClick={resetUserPassword}
            >
              Submit
            </MDBBtn>
          </Box>
        </MDBRow>
      </Paper>
    </div>
  );
}
