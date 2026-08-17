import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../../components/errorNotifier";
import { loader } from "../../../components/LoadingSpinner";

const HODReports = () => {
  const [loading, setLoading] = useState(false);
  const [deptId] = useState(
    localStorage.getItem("department") || localStorage.getItem("dept") || ""
  );
  const [students, setStudents] = useState([]); // expected shape: { id, fullname, level, balance, submitted_docs: [], non_deferrable_count }
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    level1: 0,
    level2: 0,
    level3: 0,
    totalStudents: 0,
    totalOutstanding: 0,
    totalBalance: 0,
  });
  // search and session filter
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");
  const [viewMode, setViewMode] = useState("students");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoiceItems, setSelectedInvoiceItems] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      loader({ title: "Loading reports", text: "please wait..." });

      const resp = await axios.post(`${baseUrl}officers/hod_report`, {
        department: deptId,
      });
      // loader(); // hide loader

      const data = resp.data?.data || [];
      setStudents(data);

      // compute stats
      const countSessions = [];

      data.forEach((student) => {
        const session = student.SessionOfEntry || "Unknown";
        if (!countSessions.includes(session)) {
          countSessions.push(session);
        }
      });

      // Sort sessions like 2023/2024, 2024/2025, 2025/2026
      countSessions.sort((a, b) => {
        const yearA = parseInt(a.split("/")[0]);
        const yearB = parseInt(b.split("/")[0]);
        return yearA - yearB;
      });

      console.log("Session Counts:", countSessions);

      const levelCounts = { 1: 0, 2: 0, 3: 0 };
      let totalOutstanding = 0;
      let totalBalance = 0;

      data.forEach((s) => {
        const SessionOfEntry = s.SessionOfEntry || "NON";
        let lvl1Count = 0;
        let lvl2Count = 0;
        let level3Count = 0;

        if (SessionOfEntry === countSessions[2]) {
          lvl1Count = 1;
        } else if (SessionOfEntry === countSessions[1]) {
          lvl2Count = 1;
        } else if (SessionOfEntry === countSessions[0]) {
          level3Count = 1;
        }
        levelCounts[1] = (levelCounts[1] || 0) + lvl1Count;
        levelCounts[2] = (levelCounts[2] || 0) + lvl2Count;
        levelCounts[3] = (levelCounts[3] || 0) + level3Count;
        const bal = Number(s.balance) || 0;
        totalBalance += bal;
        if (bal > 0) totalOutstanding += bal;
      });

      setStats({
        level1: levelCounts[1] || 0,
        level2: levelCounts[2] || 0,
        level3: levelCounts[3] || 0,
        totalStudents: data.length,
        totalOutstanding,
        totalBalance,
      });

      Toast.fire({ icon: "success", title: "Report fetched successfully" });
    } catch (err) {
      console.log(err);
      const message =
        err?.response?.data?.message || err.message || "Failed to load report";
      setError(message);
      Toast.fire({ icon: "error", title: message });
    } finally {
      setLoading(false);
    }
  }, [deptId]);

  useEffect(() => {
    if (deptId) {
      console.log("Fetching report for department:", deptId);
      fetchReport();
    }
  }, [deptId, fetchReport]);

  // filtered list based on searchTerm and sessionFilter
  const filteredStudents = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    return students
      .filter((s) =>
        sessionFilter ? s.SessionOfEntry === sessionFilter : true
      )
      .filter((s) =>
        departmentFilter
          ? (s.Department || s.department) === departmentFilter
          : true
      )
      .filter((s) =>
        programmeFilter
          ? (s.Programme || s.programme) === programmeFilter
          : true
      )
      .filter((s) => {
        if (!q) return true;
        const fields = [
          s.MatricNumber,
          s.ApplicationNo,
          s.Email,
          s.PhoneNumber,
          s.Fullname,
          s.Fullname && s.Fullname.toLowerCase && s.Fullname.toLowerCase(),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fields.includes(q);
      });
  }, [students, searchTerm, sessionFilter, departmentFilter, programmeFilter]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(Number(amount || 0));

  const getInvoiceCode = (invoice) =>
    invoice?.invoice_code || invoice?.invoiceCode || "";

  const getInvoiceStatusClass = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "paid") return "badge bg-success";
    if (normalized === "canceled" || normalized === "cancelled")
      return "badge bg-secondary";
    return "badge bg-warning text-dark";
  };

  const getStudentId = (student) =>
    student?.MatricNumber || student?.ApplicationNo || "-";

  const getStudentOutstanding = (student) =>
    Math.max(
      0,
      Number(student?.TotalInvoiceAmount || 0) -
        Number(student?.AccountBalance || 0)
    );

  const handleViewInvoices = async (student) => {
    const email = student?.Email || student?.email;
    if (!email) {
      Toast.fire({ icon: "error", title: "Student email is missing" });
      return;
    }

    try {
      setInvoiceLoading(true);
      setSelectedInvoice(null);
      setSelectedInvoiceItems([]);
      const resp = await axios.post(`${baseUrl}invoices/get_invoices_by_email/`, {
        email,
      });
      const invoices = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
      const decoratedInvoices = invoices.map((invoice) => ({
        ...invoice,
        Fullname: student.Fullname,
        MatricNumber: student.MatricNumber,
        ApplicationNo: student.ApplicationNo,
        AccountBalance: student.AccountBalance,
      }));

      setSelectedStudent({ ...student, invoices: decoratedInvoices });
      setViewMode("student-invoices");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to load invoices";
      Toast.fire({ icon: "error", title: message });
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleSelectInvoice = async (invoice) => {
    const invoiceCode = getInvoiceCode(invoice);
    if (!invoiceCode) {
      Toast.fire({ icon: "error", title: "Invoice code is missing" });
      return;
    }

    setSelectedInvoice(invoice);
    setSelectedInvoiceItems([]);
    setViewMode("invoice-details");

    try {
      setItemsLoading(true);
      const resp = await axios.post(
        `${baseUrl}invoices/get_invoice_items_with_status/`,
        {
          invoiceId: invoiceCode,
          email: invoice.target_id || selectedStudent?.Email,
        }
      );
      setSelectedInvoiceItems(resp.data?.data || []);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: "Failed to load invoice items",
      });
    } finally {
      setItemsLoading(false);
    }
  };

  const handleBackToStudents = () => {
    setViewMode("students");
    setSelectedStudent(null);
    setSelectedInvoice(null);
    setSelectedInvoiceItems([]);
  };

  const handleBackToInvoices = () => {
    setViewMode("student-invoices");
    setSelectedInvoice(null);
    setSelectedInvoiceItems([]);
  };

  return (
    <div className="container my-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
        <h4 className="mb-0">HOD — Department Reports</h4>

        <div className="d-flex gap-2 w-100 w-md-auto">
          <div className="input-group" style={{ minWidth: 320 }}>
            <input
              type="search"
              className="form-control"
              placeholder="Search by matric, application no, email or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search students"
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              Clear
            </button>
          </div>

          <select
            className="form-select"
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="">All Sessions</option>
            {Array.from(
              new Set(students.map((s) => s.SessionOfEntry).filter(Boolean))
            ).map((sess) => (
              <option key={sess} value={sess}>
                {sess}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ minWidth: 200 }}
          >
            <option value="">All Departments</option>
            {Array.from(
              new Set(
                students
                  .map((s) => s.Department || s.department)
                  .filter(Boolean)
              )
            ).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={programmeFilter}
            onChange={(e) => setProgrammeFilter(e.target.value)}
            style={{ minWidth: 220 }}
          >
            <option value="">All Programmes</option>
            {Array.from(
              new Set(
                students.map((s) => s.Programme || s.programme).filter(Boolean)
              )
            ).map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {viewMode === "students" && (
        <>
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-ms">
            <div className="card-body">
              <small className="text-muted">Total Students</small>
              <h5 className="mt-2">{stats.totalStudents}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-ms">
            <div className="card-body">
              <small className="text-muted">Level 1</small>
              <h5 className="mt-2">{stats.level1}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-ms">
            <div className="card-body">
              <small className="text-muted">Level 2</small>
              <h5 className="mt-2">{stats.level2}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-ms">
            <div className="card-body">
              <small className="text-muted">Level 3</small>
              <h5 className="mt-2">{stats.level3}</h5>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">Total Balance (All Students)</small>
              <h5 className="mt-2">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(stats.totalBalance || 0)}
              </h5>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <small className="text-muted">Total Outstanding</small>
              <h5 className="mt-2 text-danger">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(stats.totalOutstanding || 0)}
              </h5>
            </div>
          </div>
        </div>
      </div> */}

      <div className="card mb-4 shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Students Document Submission & Balances</strong>
          <small className="text-muted">Rows: {filteredStudents.length}</small>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student</th>
                  <th>Level</th>
                  <th>Total Invoice</th>
                  <th>Balance</th>
                  <th>Outstanding</th>
                  {/* <th>Submitted (non-def)</th> */}
                  {/* <th>Progress</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  return (
                    <React.Fragment key={s.id || s.Email || s.ApplicationNo}>
                      <tr>
                        <td>
                          <div className="fw-semibold">{s.Fullname}</div>
                          <div className="text-muted small">
                            {s.MatricNumber || s.ApplicationNo}
                          </div>
                        </td>
                        <td>{s.SessionOfEntry}</td>
                        <td>
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(Number(s.TotalInvoiceAmount || 0))}
                        </td>
                        <td>
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(Number(s.AccountBalance || 0))}
                        </td>

                        <td
                          className={
                            Number(s.TotalInvoiceAmount || 0) > 0
                              ? "text-danger"
                              : ""
                          }
                        >
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(
                            Number(s.AccountBalance || 0) -
                              Number(s.TotalInvoiceAmount || 0)
                          )}
                        </td>

                        {/* <td>
                          {
                            (s.submitted_docs || []).filter(
                              (d) =>
                                d.deferrable === "0" ||
                                d.deferrable === 0 ||
                                d.deferrable === "false"
                            ).length
                          }
                          /{s.non_deferrable_count || 0}
                        </td> */}
                        {/* <td style={{ minWidth: 220 }}>
                          <div className="progress" style={{ height: 12 }}>
                            <div
                              className={`progress-bar ${
                                pct >= 50 ? "bg-success" : "bg-warning"
                              }`}
                              role="progressbar"
                              style={{
                                width: `${Math.min(100, Math.max(0, pct))}%`,
                              }}
                              aria-valuenow={pct}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>
                          <small className="text-muted">{pct}%</small>
                        </td> */}
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewInvoices(s)}
                            disabled={invoiceLoading}
                          >
                            <i className="fas fa-eye me-1"></i>
                            {invoiceLoading ? "Loading..." : "View Invoices"}
                          </button>
                        </td>
                      </tr>

                    </React.Fragment>
                  );
                })}
                {!filteredStudents.length && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      {loading
                        ? "Loading..."
                        : searchTerm || sessionFilter
                        ? "No students match your search or session filter"
                        : "No students found for this department"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </>
      )}

      {viewMode === "student-invoices" && selectedStudent && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleBackToStudents}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back
              </button>
              <h5 className="mb-0">{selectedStudent.Fullname}'s Invoices</h5>
            </div>
          </div>

          <div className="card-body">
            <div className="alert alert-info mb-3">
              <strong>Student Details:</strong> {selectedStudent.Fullname} | ID:{" "}
              {getStudentId(selectedStudent)} | Balance:{" "}
              {formatCurrency(selectedStudent.AccountBalance)} | Unpaid Invoices:{" "}
              {formatCurrency(selectedStudent.TotalInvoiceAmount)} | Outstanding:{" "}
              <span className="text-danger">
                {formatCurrency(getStudentOutstanding(selectedStudent))}
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Invoice Code</th>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedStudent.invoices || []).map((invoice, idx) => {
                    const invoiceCode = getInvoiceCode(invoice);
                    return (
                      <tr key={`${invoiceCode || "invoice"}-${idx}`}>
                        <td>{invoiceCode || "-"}</td>
                        <td>{invoice.title || "-"}</td>
                        <td>{formatCurrency(invoice.amount)}</td>
                        <td>
                          <span className={getInvoiceStatusClass(invoice.status)}>
                            {invoice.status || "Unpaid"}
                          </span>
                        </td>
                        <td>
                          {invoice.invoice_date
                            ? new Date(invoice.invoice_date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleSelectInvoice(invoice)}
                          >
                            <i className="fas fa-eye me-1"></i>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!(selectedStudent.invoices || []).length && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No invoices found for this student
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === "invoice-details" && selectedInvoice && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header d-flex align-items-center gap-3">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleBackToInvoices}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </button>
            <h5 className="mb-0">Invoice Details</h5>
          </div>

          <div className="card-body">
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <small className="text-muted">Invoice Code</small>
                <div className="h5 text-success">
                  {getInvoiceCode(selectedInvoice) || "-"}
                </div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Status</small>
                <div>
                  <span className={getInvoiceStatusClass(selectedInvoice.status)}>
                    {selectedInvoice.status || "Unpaid"}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Title</small>
                <div>{selectedInvoice.title || "-"}</div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Priority</small>
                <div>{selectedInvoice.invoice_priority_code || "N/A"}</div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Invoice Amount</small>
                <div className="fw-semibold">
                  {formatCurrency(selectedInvoice.amount)}
                </div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Waiver</small>
                <div className="text-success">
                  {formatCurrency(selectedInvoice.waiver)}
                </div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Created Date</small>
                <div>
                  {selectedInvoice.invoice_date
                    ? new Date(selectedInvoice.invoice_date).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Due Date</small>
                <div>
                  {selectedInvoice.due_date
                    ? new Date(selectedInvoice.due_date).toLocaleDateString()
                    : "-"}
                </div>
              </div>
              <div className="col-md-12">
                <small className="text-muted">Student</small>
                <div>
                  {selectedStudent?.Fullname || selectedInvoice.Fullname || "-"} (
                  {selectedInvoice.target_id || selectedStudent?.Email || "-"})
                </div>
              </div>
            </div>

            <hr />

            <h6 className="mb-3">Invoice Items</h6>
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    <th>Amount Paid</th>
                    <th>Paid At</th>
                    <th>Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsLoading && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        Loading invoice items...
                      </td>
                    </tr>
                  )}
                  {!itemsLoading &&
                    selectedInvoiceItems.map((item) => (
                      <tr key={item.item_id || item.id || item.description}>
                        <td>{item.description || "-"}</td>
                        <td>{formatCurrency(item.amount)}</td>
                        <td>
                          <span className={getInvoiceStatusClass(item.payment_status)}>
                            {item.payment_status || "Pending"}
                          </span>
                        </td>
                        <td>{formatCurrency(item.amount_paid)}</td>
                        <td>
                          {item.paid_at
                            ? new Date(item.paid_at).toLocaleString()
                            : "-"}
                        </td>
                        <td>{item.transaction_id || "-"}</td>
                      </tr>
                    ))}
                  {!itemsLoading && !selectedInvoiceItems.length && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No invoice items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODReports;
