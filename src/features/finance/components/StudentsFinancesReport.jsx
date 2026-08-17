import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../../components/errorNotifier";
import { loader } from "../../../components/LoadingSpinner";

const StudentsFinancesReport = () => {
  const [loading, setLoading] = useState(false);
  // const [deptId, setDeptId] = useState(
  //   localStorage.getItem("department") || localStorage.getItem("dept") || ""
  // );
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
  const [expandedId, setExpandedId] = useState(null);
  // search and session filter
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");

  useEffect(() => {
    // if (deptId) {
    console.log("Fetching report for department:");
    fetchReport();
    // }
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      loader({ title: "Loading reports", text: "please wait..." });

      const resp = await axios.get(`${baseUrl}finance/students_finance_report`);
      // loader(); // hide loader

      const data = resp.data?.data || [];
      setStudents(data);

      // // compute stats
      // const countSessions = [];

      // data.forEach((student) => {
      //   const session = student.SessionOfEntry || "Unknown";
      //   if (!countSessions.includes(session)) {
      //     countSessions.push(session);
      //   }
      // });

      // // Sort sessions like 2023/2024, 2024/2025, 2025/2026
      // countSessions.sort((a, b) => {
      //   const yearA = parseInt(a.split("/")[0]);
      //   const yearB = parseInt(b.split("/")[0]);
      //   return yearA - yearB;
      // });

      // console.log("Session Counts:", countSessions);

      // const levelCounts = { 1: 0, 2: 0, 3: 0 };
      // let totalOutstanding = 0;
      // let totalBalance = 0;

      // data.forEach((s) => {
      //   const SessionOfEntry = s.SessionOfEntry || "NON";
      //   let lvl1Count = 0;
      //   let lvl2Count = 0;
      //   let level3Count = 0;

      //   if (SessionOfEntry === countSessions[2]) {
      //     lvl1Count = 1;
      //   } else if (SessionOfEntry === countSessions[1]) {
      //     lvl2Count = 1;
      //   } else if (SessionOfEntry === countSessions[0]) {
      //     level3Count = 1;
      //   }
      //   levelCounts[1] = (levelCounts[1] || 0) + lvl1Count;
      //   levelCounts[2] = (levelCounts[2] || 0) + lvl2Count;
      //   levelCounts[3] = (levelCounts[3] || 0) + level3Count;
      //   const bal = Number(s.balance) || 0;
      //   totalBalance += bal;
      //   if (bal > 0) totalOutstanding += bal;
      // });

      // setStats({
      //   level1: levelCounts[1] || 0,
      //   level2: levelCounts[2] || 0,
      //   level3: levelCounts[3] || 0,
      //   totalStudents: data.length,
      //   totalOutstanding,
      //   totalBalance,
      // });

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
  };

  const calculateDocPercentage = (student) => {
    const nonDef = Number(student.non_deferrable_count || 0);
    if (nonDef === 0) return 100;
    const submittedNonDef = (student.submitted_docs || []).filter(
      (d) =>
        d.deferrable === "0" || d.deferrable === 0 || d.deferrable === "false",
    ).length;
    return Math.round((submittedNonDef / nonDef) * 100);
  };

  // filtered list based on searchTerm and sessionFilter
  const filteredStudents = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    return students
      .filter((s) =>
        sessionFilter ? s.SessionOfEntry === sessionFilter : true,
      )
      .filter((s) =>
        departmentFilter
          ? (s.Department || s.department) === departmentFilter
          : true,
      )
      .filter((s) =>
        programmeFilter
          ? (s.Programme || s.programme) === programmeFilter
          : true,
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

  return (
    <div className="container my-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
        <h4 className="mb-0">Students Finance Reports</h4>

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
              new Set(students.map((s) => s.SessionOfEntry).filter(Boolean)),
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
                  .filter(Boolean),
              ),
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
                students.map((s) => s.Programme || s.programme).filter(Boolean),
              ),
            ).map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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
                  const pct = calculateDocPercentage(s);
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
                              Number(s.TotalInvoiceAmount || 0),
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
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() =>
                              setExpandedId(
                                expandedId === (s.id || s.ApplicationNo)
                                  ? null
                                  : s.id || s.ApplicationNo,
                              )
                            }
                          >
                            {expandedId === (s.id || s.ApplicationNo)
                              ? "Hide"
                              : "Details"}
                          </button>
                        </td>
                      </tr>

                      {expandedId === s.ApplicationNo && (
                        <tr className="table-light">
                          <td colSpan="6">
                            <div className="row">
                              <div className="col-md-6">
                                <h6 className="mb-2">Submitted Documents</h6>
                                <ul className="list-group">
                                  {(s.submitted_docs || []).map((d, i) => (
                                    <li
                                      key={i}
                                      className="list-group-item d-flex justify-content-between align-items-start"
                                    >
                                      <div>
                                        <div className="fw-semibold">
                                          {d.doc_name}
                                        </div>
                                        <small className="text-muted">
                                          {d.submission_date || ""}
                                        </small>
                                      </div>
                                      <span
                                        className={`badge ${
                                          d.deferrable === "0"
                                            ? "bg-warning"
                                            : "bg-success"
                                        } rounded-pill`}
                                      >
                                        {d.deferrable === "0"
                                          ? "Non-def"
                                          : "Deferrable"}
                                      </span>
                                    </li>
                                  ))}
                                  {!(s.submitted_docs || []).length && (
                                    <li className="list-group-item">
                                      No documents submitted
                                    </li>
                                  )}
                                </ul>
                              </div>

                              <div className="col-md-6">
                                <h6 className="mb-2">Remaining Documents</h6>
                                <p className="mb-1">
                                  <strong>Phone:</strong>{" "}
                                  {s.PhoneNumber || s.phone || "-"}
                                </p>
                                <p className="mb-1">
                                  <strong>Email:</strong>{" "}
                                  {s.Email || s.email || "-"}
                                </p>
                                <p className="mb-1">
                                  <strong>Outstanding:</strong>{" "}
                                  {new Intl.NumberFormat("en-NG", {
                                    style: "currency",
                                    currency: "NGN",
                                  }).format(
                                    Number(s.balance || s.AccountBalance || 0),
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
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
    </div>
  );
};

export default StudentsFinancesReport;
