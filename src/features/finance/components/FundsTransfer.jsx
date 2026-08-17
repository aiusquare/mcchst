import React, { useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../../components/errorNotifier";
import { loader } from "../../../components/LoadingSpinner";

const StudentSearch = ({ title, onStudentSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      return;
    }
    setLoading(true);
    setError("");
    setStudent(null);
    onStudentSelect(null);

    try {
      // Using sao_user_search endpoint as it's a general student search endpoint
      const response = await axios.post(`${baseUrl}officers/fin_user_search`, {
        searchId: searchTerm,
      });
      const data = response.data?.data;
      if (data) {
        setStudent(data);
        onStudentSelect(data);
        setError("");
      } else {
        setError("No student found with that ID.");
        Toast.fire({ icon: "warning", title: "No student found" });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to search for student.";
      setError(message);
      Toast.fire({ icon: "error", title: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h6 className="card-title">{title}</h6>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Matric No, App No, Email, or Phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "Search"
            )}
          </button>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {student && (
          <div className="alert alert-success py-2">
            <div>
              <strong>Name:</strong> {student.Fullname}
            </div>
            <div>
              <strong>ID:</strong>{" "}
              {student.MatricNumber || student.ApplicationNo}
            </div>
            <div>
              <strong>Department:</strong> {student.Department || "N/A"}
            </div>
            <div>
              <strong>Programme:</strong> {student.Programme || "N/A"}
            </div>
            <div>
              <strong>Balance:</strong>{" "}
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(student.AccountBalance || 0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FundsTransfer = () => {
  const [fromStudent, setFromStudent] = useState(null);
  const [toStudent, setToStudent] = useState(null);
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [loading, setLoading] = useState(false);
  const officerEmail = localStorage.getItem("userId");

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!fromStudent || !toStudent || !amount || !narration) {
      Toast.fire({
        icon: "warning",
        title: "Please fill all fields and select both students.",
      });
      return;
    }
    if (fromStudent.ApplicationNo === toStudent.ApplicationNo) {
      Toast.fire({
        icon: "warning",
        title: "Cannot transfer funds to the same account.",
      });
      return;
    }
    if (Number(amount) <= 0) {
      Toast.fire({
        icon: "warning",
        title: "Transfer amount must be greater than zero.",
      });
      return;
    }

    setLoading(true);
    loader({ title: "Processing Transfer...", text: "Please wait" });

    try {
      const payload = {
        from_account: fromStudent.ApplicationNo,
        to_account: toStudent.ApplicationNo,
        amount: Number(amount),
        description: narration,
        officer_email: officerEmail,
      };

      // This endpoint needs to be created on the backend
      const response = await axios.post(
        `${baseUrl}finance/transfer_funds`,
        payload
      );

      if (response.data.status) {
        Toast.fire({
          icon: "success",
          title: response.data.message || "Transfer successful!",
        });
        // Reset form
        setFromStudent(null);
        setToStudent(null);
        setAmount("");
        setNarration("");
        // We might need to refresh the student search components, but for now we'll just clear them
        // This would require a more complex state management or component structure.
      } else {
        throw new Error(response.data.message || "Transfer failed.");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "An error occurred during the transfer.";
      Toast.fire({ icon: "error", title: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-header">
          <h4 className="mb-0">Funds Transfer</h4>
        </div>
        <div className="card-body">
          <p className="card-text text-muted">
            Transfer funds between student accounts.
          </p>
          <div className="row">
            <div className="col-md-6">
              <StudentSearch
                title="From Account"
                onStudentSelect={setFromStudent}
              />
            </div>
            <div className="col-md-6">
              <StudentSearch
                title="To Account"
                onStudentSelect={setToStudent}
              />
            </div>
          </div>

          <form onSubmit={handleTransfer}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="amount" className="form-label">
                  Amount
                </label>
                <div className="input-group">
                  <span className="input-group-text">NGN</span>
                  <input
                    type="number"
                    className="form-control"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount to transfer"
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="narration" className="form-label">
                  Narration / Description
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="narration"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="e.g., Correction of payment"
                  required
                />
              </div>
            </div>
            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || !fromStudent || !toStudent || !amount}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  "Complete Transfer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FundsTransfer;
