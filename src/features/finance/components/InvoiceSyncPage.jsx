import React, { useMemo, useState } from "react";
import request from "superagent";
import Swal from "sweetalert2";
import { Toast } from "../../../components/errorNotifier";
import { baseUrl } from "../../../services/setup";
import {
  admissionProgrammes,
  entryMode,
  sessionOfEntry,
} from "../../../components/Arrays";

const emptyFilters = {
  identifier: "",
  department: "",
  programme: "",
  programmeCode: "",
  session: "",
  modeOfEntry: "",
  level: "",
  syncAll: false,
};

const uniqueSorted = (items) =>
  Array.from(new Set(items.filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b)),
  );

const localSyncOptions = {
  departments: uniqueSorted(admissionProgrammes.map((item) => item.department)),
  programmes: uniqueSorted(
    admissionProgrammes.flatMap((item) =>
      (item.programmes || []).map((programme) => programme.programme),
    ),
  ),
  programmeCodes: uniqueSorted(
    admissionProgrammes.flatMap((item) =>
      (item.programmes || []).map((programme) => programme.programmeCode),
    ),
  ),
  sessions: uniqueSorted(sessionOfEntry.map((item) => item.name)),
  modes: uniqueSorted(entryMode.map((item) => item.name || item.code)),
  levels: ["100L", "200L", "300L", "400L", "500L"],
};

const InvoiceSyncPage = () => {
  const [filters, setFilters] = useState(emptyFilters);
  const [syncing, setSyncing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState([]);
  const [selectedStudentEmails, setSelectedStudentEmails] = useState([]);
  const [selectedTemplateCodes, setSelectedTemplateCodes] = useState([]);

  const options = useMemo(() => localSyncOptions, []);

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "identifier" && value.trim() ? { syncAll: false } : {}),
    }));
  };

  const hasFilter =
    filters.syncAll ||
    filters.identifier.trim() ||
    filters.department ||
    filters.programme ||
    filters.programmeCode ||
    filters.session ||
    filters.modeOfEntry ||
    filters.level;

  const buildSelectionState = (nextPreview = preview) => {
    const studentEmails = Array.from(
      new Set(
        (nextPreview || [])
          .map((item) => item?.student?.Email)
          .filter(Boolean)
          .map((value) => String(value).trim().toLowerCase()),
      ),
    );

    const templateCodes = Array.from(
      new Set(
        (nextPreview || [])
          .flatMap((item) => item?.missing_templates || [])
          .filter(Boolean),
      ),
    );

    setSelectedStudentEmails(studentEmails);
    setSelectedTemplateCodes(templateCodes);
  };

  const reviewApplicableInvoices = async () => {
    if (!hasFilter) {
      Toast.fire({
        icon: "error",
        title: "Select a filter, search a student, or enable sync all",
      });
      return;
    }

    try {
      setPreviewLoading(true);
      setResult(null);
      const response = await request
        .post(`${baseUrl}/invoices/sync_preview`)
        .type("application/json")
        .send({ ...filters, previewOnly: true });

      const nextPreview = response.body?.preview || [];
      setPreview(nextPreview);
      buildSelectionState(nextPreview);
      Toast.fire({
        icon: "success",
        title: response.body?.message || "Applicable invoices reviewed",
      });
    } catch (error) {
      const responseText = error?.response?.text || "";
      const cleanText = responseText
        ? responseText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
        : "";
      Toast.fire({
        icon: "error",
        title:
          error?.response?.body?.message ||
          cleanText.slice(0, 180) ||
          error?.message ||
          "Unable to review applicable invoices",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const runSync = async () => {
    if (!selectedStudentEmails.length) {
      Toast.fire({
        icon: "error",
        title: "Select at least one student before copying invoices",
      });
      return;
    }

    if (!selectedTemplateCodes.length) {
      Toast.fire({
        icon: "error",
        title: "Select at least one invoice template to copy",
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: "question",
      title: "Copy selected invoices?",
      text: `This will copy only the selected invoice templates to ${selectedStudentEmails.length} selected student(s).`,
      showCancelButton: true,
      confirmButtonText: "Copy Invoices",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#003b25",
    });

    if (!confirmation.isConfirmed) return;

    try {
      setSyncing(true);
      setResult(null);
      const response = await request
        .post(`${baseUrl}/invoices/sync_filtered`)
        .type("application/json")
        .send({
          ...filters,
          selectedStudentEmails,
          selectedTemplateCodes,
        });

      setResult(response.body);
      Toast.fire({
        icon: response.body?.status === "partial" ? "warning" : "success",
        title: response.body?.message || "Selected invoices copied",
      });
    } catch (error) {
      const responseText = error?.response?.text || "";
      const cleanText = responseText
        ? responseText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
        : "";
      Toast.fire({
        icon: "error",
        title:
          error?.response?.body?.message ||
          cleanText.slice(0, 180) ||
          error?.message ||
          "Invoice copy failed",
      });
    } finally {
      setSyncing(false);
    }
  };

  const toggleStudent = (email) => {
    setSelectedStudentEmails((prev) =>
      prev.includes(email)
        ? prev.filter((item) => item !== email)
        : [...prev, email],
    );
  };

  const toggleTemplate = (code) => {
    setSelectedTemplateCodes((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code],
    );
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setResult(null);
    setPreview([]);
    setSelectedStudentEmails([]);
    setSelectedTemplateCodes([]);
  };

  const summary = result?.summary || {};
  const details = result?.details || [];

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h3 className="mb-1">Invoice Sync</h3>
              <p className="text-muted mb-0">
                Create missing invoices from applicable invoice templates.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={resetFilters}
              disabled={syncing}
            >
              <i className="fas fa-undo me-2"></i>
              Reset Filters
            </button>
          </div>

          <div className="alert alert-info">
            General invoices apply to every admitted student. Session,
            department, and programme invoices use their relevant restrictions.
            Student-specific invoices apply only to the named student.
          </div>

          <div className="row g-3">
            <div className="col-md-6 col-xl-4">
              <label className="form-label">Student Search</label>
              <input
                className="form-control"
                placeholder="Email, application no, matric no, or exact name"
                value={filters.identifier}
                onChange={(e) => handleChange("identifier", e.target.value)}
                disabled={syncing || filters.syncAll}
              />
            </div>

            <div className="col-md-6 col-xl-4">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={filters.department}
                onChange={(e) => handleChange("department", e.target.value)}
                disabled={syncing || Boolean(filters.identifier.trim())}
              >
                <option value="">All departments</option>
                {(options.departments || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 col-xl-4">
              <label className="form-label">Programme</label>
              <select
                className="form-select"
                value={filters.programme}
                onChange={(e) => handleChange("programme", e.target.value)}
                disabled={syncing || Boolean(filters.identifier.trim())}
              >
                <option value="">All programmes</option>
                {(options.programmes || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 col-xl-4">
              <label className="form-label">Programme Code</label>
              <select
                className="form-select"
                value={filters.programmeCode}
                onChange={(e) => handleChange("programmeCode", e.target.value)}
                disabled={syncing || Boolean(filters.identifier.trim())}
              >
                <option value="">All programme codes</option>
                {(options.programmeCodes || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 col-xl-4">
              <label className="form-label">Session</label>
              <select
                className="form-select"
                value={filters.session}
                onChange={(e) => handleChange("session", e.target.value)}
                disabled={syncing || Boolean(filters.identifier.trim())}
              >
                <option value="">All sessions</option>
                {(options.sessions || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 col-xl-4">
              <label className="form-label">Mode of Entry</label>
              <select
                className="form-select"
                value={filters.modeOfEntry}
                onChange={(e) => handleChange("modeOfEntry", e.target.value)}
                disabled={syncing || Boolean(filters.identifier.trim())}
              >
                <option value="">All modes</option>
                {(options.modes || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 col-xl-4">
              <label className="form-label">Level</label>
              <select
                className="form-select"
                value={filters.level}
                onChange={(e) => handleChange("level", e.target.value)}
                disabled={syncing || Boolean(filters.identifier.trim())}
              >
                <option value="">All levels</option>
                {(options.levels || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 col-xl-4 d-flex align-items-end">
              <div className="form-check">
                <input
                  id="sync-all-students"
                  type="checkbox"
                  className="form-check-input"
                  checked={filters.syncAll}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      syncAll: e.target.checked,
                      identifier: e.target.checked ? "" : prev.identifier,
                    }))
                  }
                  disabled={syncing}
                />
                <label className="form-check-label" htmlFor="sync-all-students">
                  Sync all admitted students
                </label>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              className="btn btn-info text-white"
              onClick={reviewApplicableInvoices}
              disabled={syncing || previewLoading || !hasFilter}
            >
              {previewLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Reviewing...
                </>
              ) : (
                <>
                  <i className="fas fa-search me-2"></i>
                  Review Applicable Invoices
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={runSync}
              disabled={syncing || !selectedStudentEmails.length || !selectedTemplateCodes.length}
            >
              {syncing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Copying...
                </>
              ) : (
                <>
                  <i className="fas fa-copy me-2"></i>
                  Copy Selected Invoices
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={resetFilters}
              disabled={syncing}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 className="mb-0">Review applicable targets and invoice templates</h5>
            <small className="text-muted">
              {selectedStudentEmails.length} student(s) selected · {selectedTemplateCodes.length} template(s) selected
            </small>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <div className="fw-semibold mb-2">Applicable invoice templates</div>
              <div className="d-flex flex-wrap gap-2">
                {Array.from(
                  new Set(
                    preview.flatMap((item) =>
                      (item?.applicable_templates || []).map((template) => template.invoice_code),
                    ),
                  ),
                ).map((code) => (
                  <button
                    type="button"
                    key={code}
                    className={`btn btn-sm ${selectedTemplateCodes.includes(code) ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => toggleTemplate(code)}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {preview.map((entry) => {
              const student = entry?.student || {};
              const email = String(student.Email || "").trim().toLowerCase();
              const applicableTemplates = entry?.applicable_templates || [];
              const missingTemplates = entry?.missing_templates || [];
              const existingTemplates = entry?.existing_templates || [];

              return (
                <div className="border rounded p-3 mb-3" key={email || student.ApplicationNo || student.MatricNumber}>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                    <div>
                      <div className="fw-semibold">{student.Fullname || "Unknown student"}</div>
                      <small className="text-muted">{student.Email || "No email"}</small>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedStudentEmails.includes(email)}
                        onChange={() => toggleStudent(email)}
                        id={`student-${email || student.ApplicationNo || student.MatricNumber}`}
                      />
                      <label className="form-check-label" htmlFor={`student-${email || student.ApplicationNo || student.MatricNumber}`}>
                        Copy to this student
                      </label>
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-sm-6 col-lg-3"><strong>Dept:</strong> {student.Department || "-"}</div>
                    <div className="col-sm-6 col-lg-3"><strong>Programme:</strong> {student.Programme || "-"}</div>
                    <div className="col-sm-6 col-lg-3"><strong>Session:</strong> {student.SessionOfEntry || "-"}</div>
                    <div className="col-sm-6 col-lg-3"><strong>Level:</strong> {student.Level || "-"}</div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead>
                        <tr>
                          <th style={{ width: "40px" }}></th>
                          <th>Invoice code</th>
                          <th>Title</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(applicableTemplates || []).map((template) => {
                          const code = template.invoice_code;
                          const selected = selectedTemplateCodes.includes(code);
                          return (
                            <tr key={`${email}-${code}`}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleTemplate(code)}
                                />
                              </td>
                              <td>{code}</td>
                              <td>{template.title}</td>
                              <td>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(template.amount || 0)}</td>
                              <td>
                                {existingTemplates.includes(code) ? (
                                  <span className="badge bg-secondary">Already exists</span>
                                ) : missingTemplates.includes(code) ? (
                                  <span className="badge bg-success">Ready to copy</span>
                                ) : (
                                  <span className="badge bg-light text-dark">Applicable</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="text-muted">Students Scanned</div>
                  <h3>{summary.students_scanned || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="text-muted">Invoices Generated</div>
                  <h3 className="text-success">{summary.generated_count || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="text-muted">Skipped Existing</div>
                  <h3>{summary.skipped_count || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="text-muted">Errors</div>
                  <h3 className="text-danger">{summary.error_count || 0}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">Sync Results</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>ID</th>
                    <th>Department</th>
                    <th>Programme</th>
                    <th>Session</th>
                    <th className="text-end">Matched</th>
                    <th className="text-end">Generated</th>
                    <th className="text-end">Skipped</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {!details.length && (
                    <tr>
                      <td colSpan="9" className="text-center text-muted py-4">
                        No sync result yet.
                      </td>
                    </tr>
                  )}
                  {details.map((row) => {
                    const student = row.student || {};
                    const item = row.result || {};
                    return (
                      <tr key={student.Email || student.ApplicationNo}>
                        <td>
                          <div className="fw-semibold">
                            {student.Fullname || student.Email}
                          </div>
                          <div className="small text-muted">{student.Email}</div>
                        </td>
                        <td>{student.MatricNumber || student.ApplicationNo || "-"}</td>
                        <td>{student.Department || "-"}</td>
                        <td>{student.Programme || "-"}</td>
                        <td>{student.SessionOfEntry || "-"}</td>
                        <td className="text-end">{item.matched_count || 0}</td>
                        <td className="text-end text-success">
                          {item.generated_count || 0}
                        </td>
                        <td className="text-end">{item.skipped_count || 0}</td>
                        <td>
                          {(item.errors || []).length ? (
                            <span className="text-danger">
                              {(item.errors || []).join("; ")}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceSyncPage;
