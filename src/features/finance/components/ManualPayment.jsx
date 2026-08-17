import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../../components/errorNotifier";
import { loader } from "../../../components/LoadingSpinner";

const StudentSearch = ({ onStudentSelect, resetKey }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchTerm("");
    setStudent(null);
    setError("");
  }, [resetKey]);

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
        <h6 className="card-title">Find Student</h6>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Matric No, App No, Email, or Phone"
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

const ManualPayment = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("Wallet top-up via finance");
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [lastPayment, setLastPayment] = useState(null);
  const officer = localStorage.getItem("userId");

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    if (!student) {
      setEmail("");
      setLastPayment(null);
      return;
    }
    setEmail(student?.Email || student?.email || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      Toast.fire({
        icon: "warning",
        title: "Please search and select a student first.",
      });
      return;
    }
    if (!email || !amount) {
      Toast.fire({ icon: "warning", title: "Email and amount are required." });
      return;
    }

    setLoading(true);
    loader({ title: "Processing Payment...", text: "Please wait" });

    try {
      const payload = {
        email: email.trim(),
        amount: Number(amount),
        narration,
        officer,
      };

      const response = await axios.post(
        `${baseUrl}finance/manual_pay`,
        payload
      );

      if (response.data?.status === "success" || response.data?.status) {
        Toast.fire({
          icon: "success",
          title: "Manual payment recorded successfully",
        });
        setLastPayment({
          name: selectedStudent.Fullname,
          id: selectedStudent.MatricNumber || selectedStudent.ApplicationNo,
          email: email.trim(),
          amount: Number(amount),
          time: new Date().toLocaleString(),
        });
        setSelectedStudent(null);
        setEmail("");
        setAmount("");
        setNarration("Wallet top-up via finance");
        setSearchResetKey((prev) => prev + 1);
      } else {
        throw new Error(response.data?.message || "Payment failed");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "An error occurred while recording payment.";
      Toast.fire({ icon: "error", title: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-header">
          <h4 className="mb-0">Manual Payment</h4>
        </div>
        <div className="card-body">
          <p className="text-muted">
            Credit a student's wallet manually by specifying the student's email
            address and payment amount.
          </p>
          <StudentSearch
            onStudentSelect={handleStudentSelect}
            resetKey={searchResetKey}
          />
          {!selectedStudent && (
            <div className="alert alert-warning">
              Please find and confirm the student details before recording a
              payment.
            </div>
          )}
          {lastPayment && (
            <div className="alert alert-success">
              <div className="d-flex justify-content-between flex-wrap">
                <div>
                  <strong>Last payment:</strong> {lastPayment.name} (
                  {lastPayment.id})
                  <br />
                  <small>{lastPayment.email}</small>
                </div>
                <div className="text-end">
                  <strong>
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    }).format(lastPayment.amount)}
                  </strong>
                  <br />
                  <small>{lastPayment.time}</small>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Student Email Address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="student@example.com"
                value={email}
                required
                readOnly
              />
            </div> */}
            <div className="mb-3">
              <label htmlFor="amount" className="form-label">
                Amount (NGN)
              </label>
              <input
                type="number"
                className="form-control"
                id="amount"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="narration" className="form-label">
                Narration
              </label>
              <textarea
                className="form-control"
                id="narration"
                rows="3"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
              ></textarea>
              <div className="form-text">
                This note will appear in the student's transaction history.
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !selectedStudent}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "Record Payment"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualPayment;
