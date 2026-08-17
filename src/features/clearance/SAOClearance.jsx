import React, { useEffect, useMemo, useState } from "react";
import request from "superagent";
import { Toast } from "../../components/errorNotifier";
import { baseUrl } from "../../services/setup";

const SAOClearance = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const [student, setStudent] = useState(null);
  const [fulfilled, setFulfilled] = useState("");
  const [submittedToHod, setSubmittedToHod] = useState("");
  const [students, setStudents] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");

  const fetchStudents = async () => {
    try {
      setListLoading(true);
      setListError("");
      const payload = {
        ...(departmentFilter ? { department: departmentFilter } : {}),
        ...(programmeFilter ? { programme: programmeFilter } : {}),
        ...(sessionFilter ? { session: sessionFilter } : {}),
        role: "sao",
      };

      const res = await request
        .post(`${baseUrl}clearance/list`)
        .type("application/json")
        .send(payload);

      const list = Array.isArray(res.body?.data) ? res.body.data : [];
      setStudents(list);
      if (!list.length) {
        setListError("No students returned. Adjust filters or try refresh.");
      }
    } catch (err) {
      setStudents([]);
      const apiError = err?.response?.body?.error || err.message || "";
      setListError(
        apiError
          ? `Could not load students: ${apiError}`
          : "Student list unavailable; use search above."
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchRecord = async (targetId = identifier) => {
    if (!targetId) {
      Toast.fire({ icon: "error", title: "Enter email or matric" });
      return;
    }
    try {
      setLoading(true);
      const res = await request
        .post(`${baseUrl}clearance/get`)
        .type("application/json")
        .send({ email: targetId, role: "sao" });

      setRecord(res.body?.data || null);
      setStudent(res.body?.student || null);
      setFulfilled(res.body?.data?.SAOFulfiledRegistrationRequirements || "");
      setSubmittedToHod(res.body?.data?.SAOConfirmedSubmissionToHOD || "");
      setIdentifier(targetId);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Failed to load clearance",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setIdentifier("");
    setRecord(null);
    setStudent(null);
    setFulfilled("");
    setSubmittedToHod("");
  };

  const handleSave = async () => {
    if (!identifier) {
      Toast.fire({ icon: "error", title: "Enter email or matric" });
      return;
    }
    try {
      setLoading(true);
      await request
        .post(`${baseUrl}clearance/update`)
        .type("application/json")
        .send({
          email: identifier,
          role: "sao",
          SAOFulfiledRegistrationRequirements: fulfilled,
          SAOConfirmedSubmissionToHOD: submittedToHod,
        });
      Toast.fire({ icon: "success", title: "Clearance updated" });
      clearForm();
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Update failed",
      });
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const filtered = students
      .filter((s) =>
        sessionFilter ? s.SessionOfEntry === sessionFilter : true
      )
      .filter((s) =>
        departmentFilter ? s.Department === departmentFilter : true
      )
      .filter((s) => (programmeFilter ? s.Programme === programmeFilter : true))
      .filter((s) => {
        if (!q) return true;
        const bucket = [
          s.Fullname,
          s.MatricNumber,
          s.MatNumber,
          s.ApplicationNo,
          s.Email,
          s.PhoneNumber,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return bucket.includes(q);
      })
      .filter((s) => (s.Email || s.MatricNumber || s.MatNumber ? true : false));

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const nameA = (a.Fullname || "").toLowerCase();
      const nameB = (b.Fullname || "").toLowerCase();
      const matA = (a.MatricNumber || a.MatNumber || "").toLowerCase();
      const matB = (b.MatricNumber || b.MatNumber || "").toLowerCase();
      const sessA = a.SessionOfEntry || "";
      const sessB = b.SessionOfEntry || "";

      switch (sortKey) {
        case "matric":
          return matA.localeCompare(matB);
        case "session":
          return sessA.localeCompare(sessB);
        default:
          return nameA.localeCompare(nameB);
      }
    });
    return sorted;
  }, [
    students,
    searchTerm,
    sessionFilter,
    departmentFilter,
    programmeFilter,
    sortKey,
  ]);

  const sessionOptions = useMemo(
    () =>
      Array.from(
        new Set(students.map((s) => s.SessionOfEntry).filter(Boolean))
      ).sort(),
    [students]
  );

  const departmentOptions = useMemo(
    () =>
      Array.from(
        new Set(students.map((s) => s.Department).filter(Boolean))
      ).sort(),
    [students]
  );

  const programmeOptions = useMemo(
    () =>
      Array.from(
        new Set(students.map((s) => s.Programme).filter(Boolean))
      ).sort(),
    [students]
  );

  const handleSelectStudent = (s) => {
    const target = s.Email || s.MatricNumber || s.MatNumber;
    if (!target) {
      Toast.fire({ icon: "error", title: "Student has no email/matric" });
      return;
    }
    fetchRecord(target);
  };

  return (
    <div className="container py-4">
      <h5 className="mb-3">SAO Clearance</h5>

      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Students (click to load clearance)</h6>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={fetchStudents}
              disabled={listLoading}
            >
              {listLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {listError && (
            <div className="alert alert-warning py-2 mb-2">{listError}</div>
          )}

          <div className="row g-2 mb-2">
            <div className="col-md-4 col-lg-3">
              <input
                className="form-control"
                placeholder="Search name, matric, email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4 col-lg-3">
              <select
                className="form-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 col-lg-3">
              <select
                className="form-select"
                value={programmeFilter}
                onChange={(e) => setProgrammeFilter(e.target.value)}
              >
                <option value="">All Programmes</option>
                {programmeOptions.map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 col-lg-3">
              <select
                className="form-select"
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
              >
                <option value="">All Sessions</option>
                {sessionOptions.map((sess) => (
                  <option key={sess} value={sess}>
                    {sess}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 col-lg-3">
              <select
                className="form-select"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="name">Sort by name</option>
                <option value="matric">Sort by matric</option>
                <option value="session">Sort by session</option>
              </select>
            </div>
          </div>

          <div className="table-responsive" style={{ maxHeight: "50vh" }}>
            <table className="table table-sm align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Matric</th>
                  <th>Email</th>
                  <th>Session</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => {
                  const currentId = identifier.toLowerCase();
                  const rowId = (
                    s.Email ||
                    s.MatricNumber ||
                    s.MatNumber ||
                    ""
                  ).toLowerCase();
                  const isActive = currentId && rowId === currentId;
                  return (
                    <tr
                      key={idx}
                      role="button"
                      className={isActive ? "table-active" : ""}
                      onClick={() => handleSelectStudent(s)}
                    >
                      <td>{s.Fullname || "-"}</td>
                      <td>{s.MatricNumber || s.MatNumber || "-"}</td>
                      <td>{s.Email || "-"}</td>
                      <td>{s.SessionOfEntry || "-"}</td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      {listLoading
                        ? "Loading students..."
                        : "No students found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <label className="form-label">Email or Matric</label>
              <input
                className="form-control"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="student email or matric"
              />
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-primary w-100"
                onClick={() => fetchRecord()}
                disabled={loading}
              >
                {loading ? "Loading..." : "Fetch"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {student && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="mb-2">Student</h6>
            <div className="row small">
              <div className="col-md-4">Name: {student.Fullname}</div>
              <div className="col-md-4">
                Matric: {student.MatricNumber || student.MatNumber || "-"}
              </div>
              <div className="col-md-4">Email: {student.Email}</div>
              <div className="col-md-4">Dept: {student.Department}</div>
              <div className="col-md-4">Programme: {student.Programme}</div>
              <div className="col-md-4">Session: {student.SessionOfEntry}</div>
            </div>
          </div>
        </div>
      )}

      {record && (
        <div className="card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Fulfilled Registration Requirements
                </label>
                <select
                  className="form-select"
                  value={fulfilled}
                  onChange={(e) => setFulfilled(e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Confirmed Submission to HOD
                </label>
                <select
                  className="form-select"
                  value={submittedToHod}
                  onChange={(e) => setSubmittedToHod(e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <button
              className="btn btn-success mt-3"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SAOClearance;
