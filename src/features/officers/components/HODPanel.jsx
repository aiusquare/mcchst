import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBInput,
} from "mdb-react-ui-kit";
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
import request from "superagent";
import { Toast } from "../../../components/errorNotifier";
import { baseUrl } from "../../../services/setup";
import TabPanel from "./TabPanel";

// Admission Confirmation Component
const AdmissionConfirmation = () => {
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
        baseUrl + "officers/hod_user_search",
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

      const data = response.data.data;

      if (data) {
        setUser(data);
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
        return;
      }

      const response = await fetch(baseUrl + `officers/hod_confirm_candidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.Email }),
      });

      if (response.ok) {
        setSuccess("User verification status updated successfully");
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
      <h4 className="mb-4 fw-bold">Student Confirmation</h4>

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
            I Confirm/Verify that this candidate meets all requirements for this
            programme.
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
              "Submit Verification"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const HODDashboard = () => (
  <MDBCard>
    <MDBCardBody>
      <MDBCardTitle>Department Overview</MDBCardTitle>
      <MDBCardText>
        Current semester statistics and department activities
      </MDBCardText>
      {/* Add dashboard stats here */}
    </MDBCardBody>
  </MDBCard>
);

const StudentManagement = () => (
  <MDBCard>
    <MDBCardBody>
      <MDBTable hover>
        <MDBTableHead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Level</th>
            <th>Actions</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>{/* Student list will be populated here */}</MDBTableBody>
      </MDBTable>
    </MDBCardBody>
  </MDBCard>
);

const CourseManagement = () => (
  <MDBCard>
    <MDBCardBody>
      <MDBCardTitle>Course Management</MDBCardTitle>
      <MDBTable hover>
        <MDBTableHead>
          <tr>
            <th>Course Code</th>
            <th>Title</th>
            <th>Units</th>
            <th>Level</th>
            <th>Actions</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>{/* Course list will be populated here */}</MDBTableBody>
      </MDBTable>
    </MDBCardBody>
  </MDBCard>
);

const ResultsManagement = () => (
  <MDBCard>
    <MDBCardBody>
      <MDBCardTitle>Results Management</MDBCardTitle>
      <div className="mb-3">
        <MDBBtn color="primary" className="me-2">
          Upload Results
        </MDBBtn>
        <MDBBtn color="secondary">Generate Reports</MDBBtn>
      </div>
      <MDBTable hover>
        <MDBTableHead>
          <tr>
            <th>Course</th>
            <th>Session</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>{/* Results list will be populated here */}</MDBTableBody>
      </MDBTable>
    </MDBCardBody>
  </MDBCard>
);

// Student Clearance Component
const StudentClearance = () => {
  const [rows, setRows] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleFetchData = async () => {
    if (isReady || rows.length > 0) return;

    try {
      const response = await request
        .get(
          "https://api.mcchstfuntua.edu.ng/clearance/sao/uncleared/index.php"
        )
        .type("application/json");

      setRows(response.body);
      setIsReady(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = () => {
    const formData = rows
      .map((row) => ({
        MatricNumber: row.MatricNumber,
        SAOFulfiledRegistrationRequirements: document.getElementById(
          `fulfilled-${row.MatricNumber}`
        ).checked
          ? "yes"
          : "no",
        SAOConfirmedSubmissionToHOD: document.getElementById(
          `submitted-${row.MatricNumber}`
        ).checked
          ? "yes"
          : "no",
      }))
      .filter(
        (row) =>
          row.SAOFulfiledRegistrationRequirements === "yes" ||
          row.SAOConfirmedSubmissionToHOD === "yes"
      );

    console.log("Filtered submitted data:", formData);
  };

  const StudentRow = ({ std }) => (
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
            {rows.map((std) => (
              <StudentRow key={std.MatricNumber} std={std} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center">
        <MDBBtn
          variant="contained"
          style={{ background: "#05321e" }}
          onClick={handleSubmit}
        >
          Submit
        </MDBBtn>
      </Box>
    </div>
  );
};

const HODPanel = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="hod management tabs"
        >
          <Tab label="Dashboard" />
          <Tab label="Admission Confirmation" />
          <Tab label="Student Clearance" />
          <Tab label="Courses" />
          <Tab label="Results" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <HODDashboard />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <AdmissionConfirmation />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <StudentClearance />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <CourseManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={4}>
        <ResultsManagement />
      </TabPanel>
    </div>
  );
};

export default HODPanel;
