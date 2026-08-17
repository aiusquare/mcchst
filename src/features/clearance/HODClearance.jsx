import React, { useEffect, useMemo, useState } from "react";
import request from "superagent";
import { Toast } from "../../components/errorNotifier";
import { baseUrl } from "../../services/setup";
import { formatCurrency } from "../../utils/formatCurrency";

const toBool = (value) => {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "y"].includes(normalized);
};

const boolToYesNo = (flag) => (flag ? "yes" : "no");

const getStatusLabel = (row) => {
  const raw =
    row?.RRClearanceStatus ||
    row?.clearance_status ||
    row?.status ||
    row?.HODClearanceStatus ||
    "";
  const val = String(raw).trim().toLowerCase();
  if (!val) return "-";
  if (["cleared", "approved", "completed"].includes(val)) return "Cleared";
  if (["rejected", "denied"].includes(val)) return "Rejected";
  return val.charAt(0).toUpperCase() + val.slice(1);
};

const HODClearance = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const [student, setStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const deptId =
    localStorage.getItem("department") || localStorage.getItem("dept") || "";

  const [verifiedOriginals, setVerifiedOriginals] = useState(false);
  const [sscDeficient, setSscDeficient] = useState(false);
  const [defFormFilled, setDefFormFilled] = useState(false);
  const [departmentalFile, setDepartmentalFile] = useState(false);
  const [aoA4, setAoA4] = useState("");
  const [aoFoolscaps, setAoFoolscaps] = useState("");
  const [outstandingFees, setOutstandingFees] = useState("");
  const [otherLiabilities, setOtherLiabilities] = useState("");
  const [saoRegistration, setSaoRegistration] = useState("");
  const [saoSubmission, setSaoSubmission] = useState("");
  const [registrarStatus, setRegistrarStatus] = useState("");
  const [registrarExpiration, setRegistrarExpiration] = useState("");

  const hydrateState = (data) => {
    setRecord(data || null);
    setVerifiedOriginals(toBool(data?.HODVerifiedOriginalCopies));
    setSscDeficient(toBool(data?.HODSSCEDeficient));
    setDefFormFilled(toBool(data?.HODHasFilledDeficiencyForm));
    setDepartmentalFile(toBool(data?.HODDepartmentalFile));
    setAoA4(data?.AOA4 ?? "");
    setAoFoolscaps(data?.AOFoolscaps ?? "");
    setOutstandingFees(data?.BSOutstandingFees ?? "");
    setOtherLiabilities(data?.BSOtherLiabilities ?? "");
    setSaoRegistration(data?.SAOFulfiledRegistrationRequirements ?? "");
    setSaoSubmission(data?.SAOConfirmedSubmissionToHOD ?? "");
    setRegistrarStatus(data?.RRClearanceStatus ?? "");
    setRegistrarExpiration(data?.RRClearanceExpiration ?? "");
  };

  const fetchStudents = async () => {
    try {
      setListLoading(true);
      const res = await request
        .post(`${baseUrl}officers/hod_report`)
        .type("application/json")
        .send(deptId ? { department: deptId } : {});
      setStudents(Array.isArray(res.body?.data) ? res.body.data : []);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Failed to load students" });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [deptId]);

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
        .send({ email: targetId, role: "hod" });

      setStudent(res.body?.student || null);
      hydrateState(res.body?.data || null);
      setIdentifier(targetId);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Failed to load clearance",
      });
      setRecord(null);
      setStudent(null);
    } finally {
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
        programmeFilter
          ? (s.Programme || s.programme) === programmeFilter
          : true
      )
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
      });

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
  }, [students, searchTerm, sessionFilter, programmeFilter, sortKey]);

  const handleSelectStudent = (s) => {
    const target = s.Email || s.MatricNumber || s.MatNumber;
    if (!target) {
      Toast.fire({ icon: "error", title: "Student has no email/matric" });
      return;
    }
    fetchRecord(target);
  };

  const clearForm = () => {
    setIdentifier("");
    setRecord(null);
    setStudent(null);
    setVerifiedOriginals(false);
    setSscDeficient(false);
    setDefFormFilled(false);
    setDepartmentalFile(false);
    setAoA4("");
    setAoFoolscaps("");
    setOutstandingFees("");
    setOtherLiabilities("");
    setSaoRegistration("");
    setSaoSubmission("");
    setRegistrarStatus("");
    setRegistrarExpiration("");
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
          role: "hod",
          HODVerifiedOriginalCopies: boolToYesNo(verifiedOriginals),
          HODSSCEDeficient: boolToYesNo(sscDeficient),
          HODHasFilledDeficiencyForm: boolToYesNo(defFormFilled),
          HODDepartmentalFile: boolToYesNo(departmentalFile),
          AOA4: aoA4 || 0,
          AOFoolscaps: aoFoolscaps || 0,
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

  return (
    <div className="container py-4">
      <h5 className="mb-3">HOD Clearance</h5>

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

          <div className="row g-2 mb-2">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Search name, matric, email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
              >
                <option value="">All Sessions</option>
                {Array.from(
                  new Set(students.map((s) => s.SessionOfEntry).filter(Boolean))
                )
                  .sort()
                  .map((sess) => (
                    <option key={sess} value={sess}>
                      {sess}
                    </option>
                  ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={programmeFilter}
                onChange={(e) => setProgrammeFilter(e.target.value)}
              >
                <option value="">All Programmes</option>
                {Array.from(
                  new Set(
                    students
                      .map((s) => s.Programme || s.programme)
                      .filter(Boolean)
                  )
                )
                  .sort()
                  .map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
              </select>
            </div>
            <div className="col-md-2">
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
                  <th>Status</th>
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
                      <td>{getStatusLabel(s)}</td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
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
                onClick={fetchRecord}
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
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="mb-3">Clearance Snapshot</h6>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Outstanding Fees</label>
                <input
                  className="form-control"
                  value={formatCurrency(outstandingFees || 0)}
                  disabled
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Other Liabilities</label>
                <input
                  className="form-control"
                  value={formatCurrency(otherLiabilities || 0)}
                  disabled
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">AO A4 Copies</label>
                <input
                  type="number"
                  className="form-control"
                  value={aoA4}
                  onChange={(e) => setAoA4(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">AO Foolscap Sheets</label>
                <input
                  type="number"
                  className="form-control"
                  value={aoFoolscaps}
                  onChange={(e) => setAoFoolscaps(e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <label className="form-label">
                  SAO Registration Requirements
                </label>
                <input
                  className="form-control"
                  value={saoRegistration || "-"}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">SAO Submission to HOD</label>
                <input
                  className="form-control"
                  value={saoSubmission || "-"}
                  disabled
                />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <label className="form-label">Registrar Clearance Status</label>
                <input
                  className="form-control"
                  value={registrarStatus || "-"}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Registrar Clearance Expiration
                </label>
                <input
                  className="form-control"
                  value={registrarExpiration || "-"}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {record && (
        <div className="card">
          <div className="card-body">
            <h6 className="mb-3">HOD Checks</h6>
            <div className="row g-3">
              <div className="col-md-3 form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="originals"
                  checked={verifiedOriginals}
                  onChange={(e) => setVerifiedOriginals(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="originals">
                  Verified original copies
                </label>
              </div>
              <div className="col-md-3 form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="ssce"
                  checked={sscDeficient}
                  onChange={(e) => setSscDeficient(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="ssce">
                  SSCE deficient
                </label>
              </div>
              <div className="col-md-3 form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="defForm"
                  checked={defFormFilled}
                  onChange={(e) => setDefFormFilled(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="defForm">
                  Deficiency form completed
                </label>
              </div>
              <div className="col-md-3 form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="deptFile"
                  checked={departmentalFile}
                  onChange={(e) => setDepartmentalFile(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="deptFile">
                  Departmental file opened
                </label>
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

export default HODClearance;
