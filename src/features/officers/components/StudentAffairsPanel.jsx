import React, { useState, useEffect } from "react";
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
  MDBBadge,
} from "mdb-react-ui-kit";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { Checkbox } from "@material-ui/core";
import axios from "axios";
import request from "superagent";
import { useNavigate } from "react-router-dom";
import { Toast } from "../../../components/errorNotifier";
import { postData } from "../../../utils/post-data";
import { admissionProgrammes } from "../../../components/Arrays";
import { baseUrl } from "../../../services/setup";
import TabPanel from "./TabPanel";

// Main Components from the original Students Affairs functionality
const AdmissionNumberTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasMatricNumber, setHasMatricNumber] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsSubmitted, setDocumentsSubmitted] = useState([]);
  const [documentsFetched, setDocumentsFetched] = useState(false);
  const [canGenerateMatric, setCanGenerateMatric] = useState(false);
  const [totalNonDeferrable, setTotalNonDeferrable] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [isResettingMatric, setIsResettingMatric] = useState(false);

  useEffect(() => {
    if (user?.ApplicationNo && !documentsFetched) {
      fetchDocuments(user.ApplicationNo);
    }
  }, [user, documentsFetched]);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setUser(null);

    try {
      const response = await axios.post(
        baseUrl + "officers/sao_user_search",
        {
          searchId: searchTerm,
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
        setHasMatricNumber(data.MatricNumber ? true : false);
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

  const fetchDocuments = async () => {
    try {
      const docsResponse = await request.get(
        `${baseUrl}/officers/get_required_docs`
      );
      const requiredDocs = docsResponse.body.data;

      let totalNonDef = requiredDocs.filter(
        (doc) => doc.deferrable === "0"
      ).length;
      setTotalNonDeferrable(totalNonDef);

      setDocuments(requiredDocs);
      setDocumentsFetched(true);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Failed to fetch documents",
      });
    }
  };

  const handleDocumentToggle = async (doc, isDeferrable, isSubmitted) => {
    console.log(
      "Doc:",
      doc,
      "Deferrable:",
      isDeferrable,
      "Submitted:",
      isSubmitted
    );

    if (isDeferrable === "0") {
      setSubmittedCount((prev) => {
        const newValue = prev + (isSubmitted ? 1 : -1);
        return Math.max(newValue, 0);
      });
    }

    if (isSubmitted) {
      const docObj = {
        doc_name: doc.doc_name,
        user_id: user.Email,
        deferrable: doc.deferrable,
      };

      setDocumentsSubmitted((prev) => {
        const withoutThisDoc = prev.filter((d) => d.doc_name !== doc.doc_name);
        return [...withoutThisDoc, docObj];
      });
    } else {
      setDocumentsSubmitted((prev) =>
        prev.filter((d) => d.doc_name !== doc.doc_name)
      );
    }
  };

  useEffect(() => {
    let percentageSubmitted = (submittedCount / totalNonDeferrable) * 100;
    console.log(
      `Submitted ${submittedCount} of ${totalNonDeferrable} non-deferrable documents (${percentageSubmitted}%)`
    );
    if (percentageSubmitted >= 100 && totalNonDeferrable > 0) {
      setCanGenerateMatric(true);
    } else {
      setCanGenerateMatric(false);
    }
  }, [submittedCount, totalNonDeferrable]);

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

      if (!canGenerateMatric) {
        setError(
          "All required (non-deferrable) documents must be submitted before generating matriculation number"
        );
        return;
      }

      const admissionCode = admissionProgrammes
        .flatMap((dept) => dept.programmes)
        .find(
          (prog) => prog.programmeCode === user.ProgrammeCode
        )?.admissionCode;

      if (!admissionCode) {
        setError("Invalid programme code, please contact admin");
        return;
      }

      const candidateData = {
        programme_name: user.Programme,
        programme_code: admissionCode,
        entry_session: user.SessionOfEntry,
        entry_level: user.Level,
        application_no: user.ApplicationNo,
        documents_submitted: documentsSubmitted,
      };

      const retData = await postData(
        baseUrl + "officers/generate_matric_number",
        candidateData,
        "Generating Admission Number",
        "Generating admission number for " + user.Fullname
      );

      if (retData) {
        setSuccess("Generated successfully: " + retData);
        Toast.fire({
          icon: "success",
          title: "Generated successfully",
        });
        setUser(null);
      } else {
        throw new Error("Failed to update verification status");
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err.message || "An error occurred while processing",
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetMatricNumber = async (payload) => {
    const endpoints = [
      "officers/reset_matric_number",
      "officers/remove_matric_number",
      "officers/delete_matric_number",
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.post(baseUrl + endpoint, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        return response.data;
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404 || status === 405) {
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error("No matric reset endpoint is available");
  };

  const handleResetMatricNumber = async () => {
    if (!user?.MatricNumber) {
      Toast.fire({
        icon: "error",
        title: "Student does not have a matric number to reset",
      });
      return;
    }

    const confirmed = window.confirm(
      `Reset matric number ${user.MatricNumber} for ${user.Fullname}?`
    );

    if (!confirmed) return;

    setIsResettingMatric(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        target_id: user.Email || user.ApplicationNo || user.MatricNumber,
        email: user.Email,
        application_no: user.ApplicationNo,
        matric_number: user.MatricNumber,
      };

      const response = await resetMatricNumber(payload);
      const message =
        response?.message ||
        response?.data?.message ||
        "Matric number reset successfully";

      setUser((prev) =>
        prev
          ? {
              ...prev,
              MatricNumber: "",
            }
          : prev
      );
      setHasMatricNumber(false);
      setSuccess(message);
      Toast.fire({
        icon: "success",
        title: message,
      });
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to reset matric number";
      setError(errorMessage);
      Toast.fire({
        icon: "error",
        title: errorMessage,
      });
    } finally {
      setIsResettingMatric(false);
    }
  };

  return (
    <div className="container my-5">
      <h4 className="mb-4 fw-bold">Student Registration</h4>

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
                  <th scope="row">Matric Number</th>
                  <td>{user.MatricNumber}</td>
                </tr>
                <tr>
                  <th scope="row">Account Balance</th>
                  <td>
                    <strong>
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format(user.AccountBalance || 0)}
                    </strong>
                  </td>
                </tr>
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

          {/* Document Requirements Section */}
          <div className="mt-4 mb-4">
            <h5 className="fw-semibold mb-3">Required Documents</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, i) => (
                    <tr key={i}>
                      <td>{doc.doc_name}</td>
                      <td>
                        <span
                          className={`badge ${
                            doc?.deferrable === "1"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {doc?.deferrable === "1"
                            ? "Deferrable"
                            : "Non Defferrable"}
                        </span>
                      </td>
                      <td>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={doc.isSubmitted}
                            onChange={(e) =>
                              handleDocumentToggle(
                                doc,
                                doc.deferrable,
                                e.target.checked
                              )
                            }
                          />
                          <label className="form-check-label">
                            Mark as{" "}
                            {doc.isSubmitted ? "not submitted" : "submitted"}
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <input
              className="form-check-input mb-2"
              type="checkbox"
              id="verifyCheck"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
            />
            <label className="form-check-label ms-2">
              I Confirm/Verify that this candidate meets all requirements for
              Registration.
            </label>
          </div>

          {hasMatricNumber && (
            <div className="text-warning mt-2">
              <small>
                Existing matric number detected. Reset it before generating a
                new one.
              </small>
            </div>
          )}

          <div className="d-flex flex-wrap gap-2 mt-3">
            {hasMatricNumber && (
              <button
                className="btn btn-outline-danger"
                onClick={handleResetMatricNumber}
                disabled={loading || isResettingMatric}
              >
                {isResettingMatric ? (
                  <div
                    className="spinner-border spinner-border-sm text-danger"
                    role="status"
                  />
                ) : (
                  "Reset Matric Number"
                )}
              </button>
            )}

            <button
              className="btn btn-success"
              onClick={handleSubmitVerification}
              disabled={
                loading ||
                isResettingMatric ||
                hasMatricNumber ||
                !(isVerified && canGenerateMatric)
              }
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
          {!canGenerateMatric && documentsFetched && (
            <div className="text-danger mt-2">
              <small>
                All required documents must be submitted before generating
                matriculation number
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DocumentRegistryTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [student, setStudent] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Toast.fire({ icon: "error", title: "Enter email/matric/application no" });
      return;
    }
    try {
      setLoading(true);
      setStudent(null);
      setDocs([]);
      const res = await request
        .post(baseUrl + "officers/sao_user_search")
        .type("application/json")
        .send({ searchId: searchTerm.trim() });
      if (!res.body?.data) {
        Toast.fire({ icon: "error", title: "Student not found" });
        return;
      }
      setStudent(res.body.data);
      await fetchDocs(res.body.data.Email || searchTerm.trim());
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.message || "Search failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocs = async (targetId) => {
    try {
      const res = await request
        .post(baseUrl + "officers/document_registry_status")
        .type("application/json")
        .send({ target_id: targetId });
      setDocs(res.body?.data || []);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Could not load documents" });
    }
  };

  const handleToggle = async (docName, submitted) => {
    if (!student?.Email) {
      Toast.fire({ icon: "error", title: "Search a student first" });
      return;
    }
    try {
      setSaving(true);
      await request
        .post(baseUrl + "officers/update_document_registry")
        .type("application/json")
        .send({ target_id: student.Email, doc_name: docName, submitted });
      setDocs((prev) =>
        prev.map((d) =>
          d.doc_name === docName
            ? {
                ...d,
                submitted,
                submission_date: submitted ? new Date().toISOString() : null,
              }
            : d
        )
      );
      Toast.fire({ icon: "success", title: "Saved" });
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Update failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const submittedList = docs.filter((d) => d.submitted);
  const pendingList = docs.filter((d) => !d.submitted);

  return (
    <div className="container my-4">
      <h5 className="fw-bold mb-3">Documents Registry</h5>
      <div className="row g-2 align-items-end mb-3">
        <div className="col-md-6">
          <label className="form-label">Email / Matric / Application No</label>
          <input
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student"
          />
        </div>
        <div className="col-md-3">
          <button
            className="btn btn-primary w-100"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {student && (
        <div className="card mb-3">
          <div className="card-body">
            <div className="fw-semibold">{student.Fullname}</div>
            <div className="small text-muted">{student.Email}</div>
            <div className="small text-muted">
              {student.MatricNumber || student.ApplicationNo}
            </div>
            <div className="small">
              {student.Department} • {student.Programme}
            </div>
          </div>
        </div>
      )}

      {docs.length > 0 && (
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Pending documents</h6>
                  {pendingList.length === 0 && (
                    <span className="badge bg-success">None</span>
                  )}
                </div>
                {pendingList.length === 0 && (
                  <div className="text-muted small">All submitted.</div>
                )}
                {pendingList.length > 0 && (
                  <ul className="list-unstyled mb-0">
                    {pendingList.map((doc) => (
                      <li
                        key={doc.doc_name}
                        className="d-flex justify-content-between align-items-center py-1 border-bottom"
                      >
                        <span>
                          {doc.doc_name}
                          {doc.deferrable ? (
                            <span className="badge bg-secondary ms-2">
                              Deferrable
                            </span>
                          ) : null}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-success"
                          disabled={saving}
                          onClick={() => handleToggle(doc.doc_name, true)}
                        >
                          Mark submitted
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Submitted documents</h6>
                  {submittedList.length === 0 && (
                    <span className="badge bg-warning text-dark">None</span>
                  )}
                </div>
                {submittedList.length === 0 && (
                  <div className="text-muted small">No submissions yet.</div>
                )}
                {submittedList.length > 0 && (
                  <ul className="list-unstyled mb-0">
                    {submittedList.map((doc) => (
                      <li
                        key={doc.doc_name}
                        className="d-flex justify-content-between align-items-center py-1 border-bottom"
                      >
                        <div>
                          <div>{doc.doc_name}</div>
                          <div className="small text-muted">
                            {doc.submission_date
                              ? doc.submission_date
                              : "Submitted"}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={saving}
                          onClick={() => handleToggle(doc.doc_name, false)}
                        >
                          Mark unsubmitted
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
    if (rows.length > 0) return;

    try {
      await request
        .get(
          "https://api.mcchstfuntua.edu.ng/clearance/sao/uncleared/index.php"
        )
        .type("application/json")
        .then((response) => {
          // console.log("FETCH RES: ", response.body);
          setRows(response.body);
          setIsReady(true);
        });
    } catch (err) {
      console.error(err);
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

const SAODashboard = () => {
  const [stats, setStats] = useState({
    pendingRegistrations: 0,
    pendingClearance: 0,
    hostelOccupancy: 0,
    activeComplaints: 0,
  });

  useEffect(() => {
    // TODO: Fetch dashboard stats from API
    setStats({
      pendingRegistrations: 15,
      pendingClearance: 8,
      hostelOccupancy: 75,
      activeComplaints: 3,
    });
  }, []);

  return (
    <MDBCard>
      <MDBCardBody>
        <MDBCardTitle>Student Affairs Overview</MDBCardTitle>
        <MDBCardText>Student welfare and activities management</MDBCardText>

        <Grid container spacing={3} className="mt-3">
          <Grid item xs={12} md={3}>
            <MDBCard background="primary" className="text-white">
              <MDBCardBody>
                <MDBCardTitle>Pending Registrations</MDBCardTitle>
                <h3>{stats.pendingRegistrations}</h3>
              </MDBCardBody>
            </MDBCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <MDBCard background="info" className="text-white">
              <MDBCardBody>
                <MDBCardTitle>Pending Clearance</MDBCardTitle>
                <h3>{stats.pendingClearance}</h3>
              </MDBCardBody>
            </MDBCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <MDBCard background="success" className="text-white">
              <MDBCardBody>
                <MDBCardTitle>Hostel Occupancy</MDBCardTitle>
                <h3>{stats.hostelOccupancy}%</h3>
              </MDBCardBody>
            </MDBCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <MDBCard background="warning" className="text-white">
              <MDBCardBody>
                <MDBCardTitle>Active Complaints</MDBCardTitle>
                <h3>{stats.activeComplaints}</h3>
              </MDBCardBody>
            </MDBCard>
          </Grid>
        </Grid>
      </MDBCardBody>
    </MDBCard>
  );
};

const HostelManagement = () => {
  const [hostelData, setHostelData] = useState([]);

  useEffect(() => {
    // TODO: Fetch hostel data from API
    setHostelData([
      { block: "A", room: "101", capacity: 4, occupied: 3 },
      { block: "A", room: "102", capacity: 4, occupied: 4 },
      { block: "B", room: "201", capacity: 2, occupied: 1 },
    ]);
  }, []);

  return (
    <MDBCard>
      <MDBCardBody>
        <MDBCardTitle>Hostel Management</MDBCardTitle>
        <div className="mb-3">
          <MDBBtn color="primary" className="me-2">
            Assign Rooms
          </MDBBtn>
          <MDBBtn color="secondary">View Occupancy</MDBBtn>
        </div>
        <MDBTable hover>
          <MDBTableHead>
            <tr>
              <th>Block</th>
              <th>Room</th>
              <th>Capacity</th>
              <th>Occupied</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {hostelData.map((room, index) => (
              <tr key={index}>
                <td>{room.block}</td>
                <td>{room.room}</td>
                <td>{room.capacity}</td>
                <td>{room.occupied}</td>
                <td>
                  <MDBBadge
                    color={
                      room.occupied >= room.capacity ? "danger" : "success"
                    }
                  >
                    {room.occupied >= room.capacity ? "Full" : "Available"}
                  </MDBBadge>
                </td>
                <td>
                  <MDBBtn size="sm" color="info">
                    Details
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      </MDBCardBody>
    </MDBCard>
  );
};

const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    // TODO: Fetch complaints from API
    setComplaints([
      {
        id: "TK001",
        student: "John Doe",
        category: "Academic",
        status: "Open",
      },
      {
        id: "TK002",
        student: "Jane Smith",
        category: "Hostel",
        status: "In Progress",
      },
      {
        id: "TK003",
        student: "Mike Johnson",
        category: "Administrative",
        status: "Closed",
      },
    ]);
  }, []);

  return (
    <MDBCard>
      <MDBCardBody>
        <MDBCardTitle>Student Complaints</MDBCardTitle>
        <MDBTable hover>
          <MDBTableHead>
            <tr>
              <th>Ticket ID</th>
              <th>Student</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {complaints.map((complaint, index) => (
              <tr key={index}>
                <td>{complaint.id}</td>
                <td>{complaint.student}</td>
                <td>{complaint.category}</td>
                <td>
                  <MDBBadge
                    color={
                      complaint.status === "Open"
                        ? "danger"
                        : complaint.status === "In Progress"
                        ? "warning"
                        : "success"
                    }
                  >
                    {complaint.status}
                  </MDBBadge>
                </td>
                <td>
                  <MDBBtn size="sm" color="info" className="me-2">
                    View
                  </MDBBtn>
                  <MDBBtn size="sm" color="success">
                    Update
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      </MDBCardBody>
    </MDBCard>
  );
};

const ExitCardListTab = () => {
  const navigate = useNavigate();

  return (
    <MDBCard>
      <MDBCardBody>
        <MDBCardTitle>Hostel Exit Card List</MDBCardTitle>
        <MDBCardText>
          View and download exit card list for hostel students
        </MDBCardText>
        <MDBBtn
          color="primary"
          onClick={() => navigate("/admin/exit-card-list")}
        >
          View Exit Card List
        </MDBBtn>
      </MDBCardBody>
    </MDBCard>
  );
};

const StudentAffairsPanel = () => {
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
          aria-label="student affairs tabs"
        >
          <Tab label="Dashboard" />
          <Tab label="Registration" />
          <Tab label="Clearance" />
          <Tab label="Hostel" />
          <Tab label="Complaints" />
          <Tab label="Documents" />
          <Tab label="Exit Card" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <SAODashboard />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <AdmissionNumberTab />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <ClearanceTab />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <HostelManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={4}>
        <ComplaintsManagement />
      </TabPanel>
      <TabPanel value={activeTab} index={5}>
        <DocumentRegistryTab />
      </TabPanel>
      <TabPanel value={activeTab} index={6}>
        <ExitCardListTab />
      </TabPanel>
    </div>
  );
};

export default StudentAffairsPanel;
