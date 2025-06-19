import "../../admin/css/style.css";

import { MDBBtn, MDBCol, MDBInput, MDBRow } from "mdb-react-ui-kit";

import { useEffect } from "react";
import { useState } from "react";
import request from "superagent";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { Checkbox } from "@material-ui/core";
import axios from "axios";
import { Toast } from "../../errorNotifier";
import { baseUrl } from "../../../services/setup";

export default function StudentsAffairsTab() {
  const [value, setValue] = useState(1);

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

  return (
    <div>
      {/* Centered Heading */}
      <div className="text-center mb-4">
        <h4>Registration Management</h4>
      </div>

      {/* Layout Row */}
      <MDBRow className="justify-content-center">
        <MDBCol>
          <Box
            sx={{
              display: "flex",
              bgcolor: "background.paper",
              minHeight: 400,
              border: "1px solid #ccc",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <AdmissionNumberTab />
          </Box>
        </MDBCol>
      </MDBRow>
    </div>
  );
}

const AdmissionNumberTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setUser(null);

    const department = localStorage.getItem("department");

    try {
      const response = await axios.post(
        baseUrl + "officers/sao_user_search",
        {
          searchId: searchTerm,
          department: department,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Assuming the API returns the data in response.data
      const data = response.data.data;

      if (data) {
        setUser(data); // Take first match
        // setIsVerified(data[0].verified || false); // Set initial verification status
      } else {
        setError("No user found with that information");
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to search for user";
      setError(errorMessage);

      Toast.fire({
        icon: "error",
        title: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!user) return;

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      if (!isVerified) {
        setError("Please check the verification box");
        return; // Stop the function if not verified
      }
      // Replace with your actual verification API endpoint
      const response = await fetch(
        baseUrl + `Officers/sao_generate_mat_number`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.Email }),
        }
      );

      if (response.ok) {
        setSuccess("User verification status updated successfully");
        // Optionally refresh user data
        const updatedUser = await response.json();
        // setUser(updatedUser);
        setUser(null);
      } else {
        throw new Error("Failed to update verification status");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-sm rounded-4 p-4">
        <h4 className="mb-4 fw-bold">Student Registration</h4>

        {/* Search Section */}
        <div className="row g-2 align-items-center mb-3">
          <div className="col-md-9">
            <input
              type="text"
              className="form-control"
              placeholder="Search by email, phone, or application ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="col-md-3 d-grid">
            <button
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
            >
              {loading ? (
                <div
                  className="spinner-border spinner-border-sm text-light"
                  role="status"
                />
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success mb-3" role="alert">
            {success}
          </div>
        )}

        {/* User Display Section */}
        {user && (
          <div className="mt-4">
            <h5 className="fw-semibold mb-3">Candidate Information</h5>
            <div className="table-responsive mb-3">
              <table className="table table-bordered table-sm">
                <tbody>
                  <tr>
                    <th scope="row" style={{ width: "150px" }}>
                      Fullname
                    </th>
                    <td>{user.Fullname}</td>
                  </tr>
                  <tr>
                    <th scope="row">Email</th>
                    <td>{user.Email}</td>
                  </tr>
                  <tr>
                    <th scope="row">Phone Number</th>
                    <td>{user.PhoneNumber}</td>
                  </tr>
                  <tr>
                    <th scope="row">Application ID</th>
                    <td>{user.ApplicationNo}</td>
                  </tr>

                  <tr>
                    <th scope="row">Programme</th>
                    <td>{user.Programme}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <input
                className="form-check-input mb-2"
                type="checkbox"
                id="verifyCheck"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
              />
              I Confirm/Verify that this candidate meets all requirements for
              Registration.
            </div>

            <button
              className="btn btn-success"
              onClick={handleSubmitVerification}
              disabled={loading}
            >
              {loading ? (
                <div
                  className="spinner-border spinner-border-sm text-light"
                  role="status"
                />
              ) : (
                "Generate Admission Number"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ClearanceTab = () => {
  const [rows, setRows] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleFetchData = async () => {
    if (isReady) {
      return;
    }
    if (rows.length > 0) return; // Prevents unnecessary fetches

    try {
      await request
        .get(
          "https://api.mcchstfuntua.edu.ng/clearance/sao/uncleared/index.php"
        )
        .type("application/json")
        .then((response) => {
          console.log("FETCH RES: ", response.body);

          setRows(response.body);
          setIsReady(true);
        });
    } catch (err) {
      // console.log(err);
    }
  };

  const handleSubmit = () => {
    const formData = rows
      .map((row) => {
        const fulfilledChecked = document.getElementById(
          `fulfilled-${row.MatricNumber}`
        ).checked;
        const submittedChecked = document.getElementById(
          `submitted-${row.MatricNumber}`
        ).checked;

        return {
          MatricNumber: row.MatricNumber,
          SAOFulfiledRegistrationRequirements: fulfilledChecked ? "yes" : "no",
          SAOConfirmedSubmissionToHOD: submittedChecked ? "yes" : "no",
        };
      })
      // Filter rows where at least one checkbox is checked ("yes")
      .filter(
        (row) =>
          row.SAOFulfiledRegistrationRequirements === "yes" ||
          row.SAOConfirmedSubmissionToHOD === "yes"
      );

    console.log("Filtered submitted data:", formData);
    // Send only filtered data to API
    // Example:
    // request.post("your-api-endpoint").send(formData).then(...)
  };

  const StudentRow = ({ std, index }) => {
    return (
      <TableRow key={std.MatricNumber}>
        <TableCell>{std.Fullname}</TableCell>
        <TableCell>{std.MatricNumber}</TableCell>
        <TableCell>{std.Department}</TableCell>
        <TableCell>{std.Programme}</TableCell>
        <TableCell>
          <Checkbox
            id={`fulfilled-${std.MatricNumber}`}
            defaultChecked={std.SAOFulfiledRegistrationRequirements === "yes"}
          />
        </TableCell>
        <TableCell>
          <Checkbox
            id={`submitted-${std.MatricNumber}`}
            defaultChecked={std.SAOConfirmedSubmissionToHOD === "yes"}
          />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <MDBInput label="Search" type="text" size="lg" />
        </Grid>
        <Grid item xs={12} md={4}>
          <MDBBtn className="w-100" size="lg" style={{ background: "#05321e" }}>
            Search
          </MDBBtn>
        </Grid>
      </Grid>

      {/* Table */}

      <TableContainer sx={{ maxHeight: 400, mb: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Full Name</strong>
              </TableCell>
              <TableCell>
                <strong>Matric Number</strong>
              </TableCell>
              <TableCell>
                <strong>Department</strong>
              </TableCell>
              <TableCell>
                <strong>Programme</strong>
              </TableCell>
              <TableCell>
                <strong>Requirements</strong>
              </TableCell>
              <TableCell>
                <strong>Submitted to HOD</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((std, index) => (
              <StudentRow
                key={std.MatricNumber}
                std={std}
                index={index}
                onChange={(updatedStd) => {
                  const updatedRows = [...rows];
                  updatedRows[index] = updatedStd;
                  setRows(updatedRows);
                }}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Submit Button */}
      <Box display="flex" justifyContent="center">
        <MDBBtn
          variant="contained"
          style={{ background: "#05321e" }}
          onClick={handleSubmit}
        >
          Submit
        </MDBBtn>
      </Box>
      {/* </TabPanel> */}
    </div>
  );
};
