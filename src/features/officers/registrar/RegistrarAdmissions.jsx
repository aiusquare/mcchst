import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { Toast } from "../../../components/errorNotifier";
import { baseUrl } from "../../../services/setup";
import request from "superagent";

const STATUS_LABELS = {
  pending: { label: "Pending", cls: "badge bg-warning text-dark" },
  approved: { label: "Approved", cls: "badge bg-success" },
  rejected: { label: "Rejected", cls: "badge bg-danger" },
};

const RegistrarAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAdmissions = useCallback(
    async (status = statusFilter) => {
      try {
        setLoading(true);
        const res = await request
          .get(`${baseUrl}/officers/list_pending_admissions`)
          .query({ status });
        setAdmissions(res.body?.data || []);
      } catch {
        Toast.fire({
          icon: "error",
          title: "Failed to load pending admissions",
        });
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    fetchAdmissions(statusFilter);
    setSelectedIds([]);
  }, [statusFilter]);

  // ── helpers ──────────────────────────────────────────────────────

  const filtered = admissions.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.fullname || "").toLowerCase().includes(q) ||
      (a.application_no || "").toLowerCase().includes(q) ||
      (a.department || "").toLowerCase().includes(q) ||
      (a.programme || "").toLowerCase().includes(q)
    );
  });

  const pendingItems = filtered.filter((a) => a.status === "pending");
  const selectableIds = pendingItems.map((a) => String(a.id));
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : selectableIds);
  };

  const toggleSelect = (id) => {
    const sid = String(id);
    setSelectedIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    );
  };

  // ── single action ────────────────────────────────────────────────

  const processOne = async (admission) => {
    const result = await Swal.fire({
      title: "Review Admission",
      html: `<strong>${admission.fullname}</strong><br/>${admission.programme || ""}`,
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Approve",
      denyButtonText: "Reject",
      confirmButtonColor: "#198754",
      denyButtonColor: "#dc3545",
    });

    if (!result.isConfirmed && !result.isDenied) return;
    const action = result.isConfirmed ? "approve" : "reject";

    let comment = "";
    if (result.isDenied) {
      const { value } = await Swal.fire({
        title: "Rejection reason (optional)",
        input: "textarea",
        inputPlaceholder: "Enter reason…",
        showCancelButton: true,
      });
      if (value !== undefined) comment = value;
    }

    try {
      setProcessingId(admission.id);
      await request
        .post(`${baseUrl}/officers/registrar_process_admission`)
        .type("application/json")
        .send({ id: admission.id, action, comment });
      Toast.fire({ icon: "success", title: `Admission ${action}d` });
      fetchAdmissions(statusFilter);
      setSelectedIds((prev) => prev.filter((x) => x !== String(admission.id)));
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Action failed",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // ── bulk action ───────────────────────────────────────────────────

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;

    const label = action === "approve" ? "Approve" : "Reject";
    const result = await Swal.fire({
      title: `${label} ${selectedIds.length} admission(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: label,
      confirmButtonColor: action === "approve" ? "#198754" : "#dc3545",
    });
    if (!result.isConfirmed) return;

    let comment = "";
    if (action === "reject") {
      const { value } = await Swal.fire({
        title: "Rejection reason (optional)",
        input: "textarea",
        inputPlaceholder: "Enter reason…",
        showCancelButton: true,
      });
      if (value !== undefined) comment = value;
    }

    try {
      setProcessingId("bulk");
      await Promise.all(
        selectedIds.map((id) =>
          request
            .post(`${baseUrl}/officers/registrar_process_admission`)
            .type("application/json")
            .send({ id, action, comment }),
        ),
      );
      Toast.fire({
        icon: "success",
        title: `${selectedIds.length} admission(s) ${action}d`,
      });
      setSelectedIds([]);
      fetchAdmissions(statusFilter);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Bulk action failed",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // ── render ────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0">Admission Requests</h5>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Status filter */}
            <div className="btn-group btn-group-sm" role="group">
              {["pending", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  className={`btn btn-outline-secondary ${statusFilter === s ? "active" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: 200 }}
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Refresh */}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => fetchAdmissions(statusFilter)}
              disabled={loading}
            >
              {loading ? "Loading…" : "REFRESH"}
            </button>

            {/* Bulk actions (pending only) */}
            {statusFilter === "pending" && (
              <>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleBulkAction("approve")}
                  disabled={selectedIds.length === 0 || processingId !== null}
                >
                  APPROVE SELECTED
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleBulkAction("reject")}
                  disabled={selectedIds.length === 0 || processingId !== null}
                >
                  REJECT SELECTED
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0">
              <thead className="table-light">
                <tr>
                  {statusFilter === "pending" && (
                    <th style={{ width: 32 }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        disabled={selectableIds.length === 0}
                        aria-label="Select all"
                      />
                    </th>
                  )}
                  <th>Name</th>
                  <th>Application No</th>
                  <th>Department</th>
                  <th>Programme</th>
                  <th>Phone</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  {statusFilter !== "pending" && <th>Comment</th>}
                  {statusFilter !== "pending" && <th>Processed</th>}
                  {statusFilter === "pending" && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={statusFilter === "pending" ? 9 : 9}
                      className="text-center py-4 text-muted"
                    >
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={statusFilter === "pending" ? 9 : 9}
                      className="text-center py-4 text-muted"
                    >
                      No admission requests found
                    </td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((adm) => {
                    const sid = String(adm.id);
                    const isPending = adm.status === "pending";
                    const badge =
                      STATUS_LABELS[adm.status] || STATUS_LABELS.pending;
                    const isProcessing =
                      processingId === adm.id || processingId === "bulk";

                    return (
                      <tr key={adm.id}>
                        {statusFilter === "pending" && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(sid)}
                              onChange={() => toggleSelect(adm.id)}
                              disabled={!isPending}
                              aria-label={`Select ${adm.fullname}`}
                            />
                          </td>
                        )}
                        <td className="fw-semibold">{adm.fullname || "-"}</td>
                        <td>
                          <span className="small text-muted">
                            {adm.application_no || "-"}
                          </span>
                        </td>
                        <td>{adm.department || "-"}</td>
                        <td>{adm.programme || "-"}</td>
                        <td>{adm.phone_number || "-"}</td>
                        <td>
                          <span className="small text-muted">
                            {adm.submitted_at
                              ? new Date(adm.submitted_at).toLocaleDateString()
                              : "-"}
                          </span>
                        </td>
                        <td>
                          <span className={badge.cls}>{badge.label}</span>
                        </td>
                        {statusFilter !== "pending" && (
                          <td>
                            <span className="small text-muted">
                              {adm.registrar_comment || "-"}
                            </span>
                          </td>
                        )}
                        {statusFilter !== "pending" && (
                          <td>
                            <span className="small text-muted">
                              {adm.processed_at
                                ? new Date(
                                    adm.processed_at,
                                  ).toLocaleDateString()
                                : "-"}
                            </span>
                          </td>
                        )}
                        {statusFilter === "pending" && (
                          <td>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => processOne(adm)}
                              disabled={!isPending || isProcessing}
                            >
                              {isProcessing ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                />
                              ) : (
                                "REVIEW"
                              )}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length > 0 && (
          <div className="card-footer text-muted small">
            Showing {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            {statusFilter === "pending" && selectedIds.length > 0
              ? ` · ${selectedIds.length} selected`
              : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrarAdmissions;
