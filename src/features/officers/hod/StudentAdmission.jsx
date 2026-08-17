import { useState } from "react";

import axios from "axios";
import { Toast } from "../../../components/errorNotifier";
import { baseUrl } from "../../../services/setup";

// Admission Confirmation Component
const StudentsAdmission = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [registrarStatus, setRegistrarStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setUser(null);
    setRegistrarStatus(null);
    setIsVerified(false);

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
        },
      );

      const data = response.data.data;

      if (data) {
        setUser(data);
        // Check registrar approval status
        const statusRes = await fetch(baseUrl + "officers/get_registrar_approval_status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.Email }),
        });
        const statusData = await statusRes.json();
        const row = statusData?.data;
        setRegistrarStatus(row?.status || "not_submitted");
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

      const data = await response.json();

      if (response.ok && data.status !== "error") {
        setSuccess("Admission confirmed successfully.");
        setUser(null);
        setIsVerified(false);
        setRegistrarStatus(null);
      } else {
        throw new Error(data.message || "Failed to confirm admission");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const registrarBadge = () => {
    switch (registrarStatus) {
      case "approved":
        return <span className="badge bg-success ms-2">Registrar Approved</span>;
      case "pending":
        return <span className="badge bg-warning text-dark ms-2">Awaiting Registrar Approval</span>;
      case "rejected":
        return <span className="badge bg-danger ms-2">Rejected by Registrar</span>;
      case "not_submitted":
        return <span className="badge bg-secondary ms-2">Not yet submitted to Registrar</span>;
      default:
        return null;
    }
  };

  const canConfirm = registrarStatus === "approved";

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
          <h5 className="fw-semibold mb-3">
            Candidate Information
            {registrarBadge()}
          </h5>
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

          {!canConfirm && (
            <div className="alert alert-warning">
              {registrarStatus === "rejected"
                ? "This admission was rejected by the Registrar and cannot be confirmed."
                : "This candidate's admission must be approved by the Registrar before HOD confirmation."}
            </div>
          )}

          {canConfirm && (
            <>
              <div className="mb-3">
                <input
                  className="form-check-input me-2"
                  type="checkbox"
                  id="verifyCheck"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                />
                <label htmlFor="verifyCheck">
                  I Confirm/Verify that this candidate meets all requirements for this programme.
                </label>
              </div>

              <button
                className="btn btn-success"
                onClick={handleSubmitVerification}
                disabled={loading || !isVerified}
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentsAdmission;
