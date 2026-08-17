import React, { useCallback, useEffect, useMemo, useState } from "react";
import request from "superagent";
import Swal from "sweetalert2";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../../components/errorNotifier";

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const EXPIRING_SOON_DAYS = 7;

const currency = (v) =>
  `NGN ${Number(v || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const parseDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const daysRemaining = (dateStr) => {
  const d = parseDate(dateStr);
  if (!d) return null;
  d.setHours(0, 0, 0, 0);
  return Math.round((d - TODAY) / 86400000);
};

const classifyExpiry = (dateStr) => {
  const days = daysRemaining(dateStr);
  if (days === null) return "no_date";
  if (days < 0) return "expired";
  if (days <= EXPIRING_SOON_DAYS) return "expiring_soon";
  return "active";
};

const getStudentName = (item) =>
  item.student_name || item.pre_fullname || item.app_fullname || item.target_id || "Unknown";

const getApplicationNo = (item) =>
  item.application_number || item.pre_application_id || item.app_application_id || "-";

const EXPIRY_LABELS = {
  expired: "Expired",
  expiring_soon: "Expiring Soon",
  active: "Active",
  no_date: "No Date Set",
};

const EXPIRY_BADGE = {
  expired: "badge bg-danger",
  expiring_soon: "badge bg-warning text-dark",
  active: "badge bg-success",
  no_date: "badge bg-secondary",
};

const ROW_BG = {
  expired: "#fff5f5",
  expiring_soon: "#fffbf0",
  active: "",
  no_date: "",
};

export default function UndertakingTrackerPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");
  const [extendTarget, setExtendTarget] = useState(null); // { id, name, currentDate }
  const [extendDate, setExtendDate] = useState("");
  const [extendNote, setExtendNote] = useState("");
  const [extending, setExtending] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request
        .get(`${baseUrl}/invoices/list_undertakings`)
        .query({ status: "approved" });
      setItems(res.body?.data || []);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Failed to load undertakings",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const enriched = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        _expiry: classifyExpiry(item.expected_clearance_date),
        _days: daysRemaining(item.expected_clearance_date),
        _name: getStudentName(item),
        _kind: item.kind || "financial",
      })),
    [items]
  );

  const departments = useMemo(() => {
    const set = new Set();
    enriched.forEach((r) => {
      const d = r.student_department || r.invoice_department || "";
      if (d) set.add(d);
    });
    return Array.from(set).sort();
  }, [enriched]);

  const stats = useMemo(() => {
    const counts = { expired: 0, expiring_soon: 0, active: 0, no_date: 0 };
    enriched.forEach((r) => counts[r._expiry]++);
    return { total: enriched.length, ...counts };
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((r) => {
      if (expiryFilter !== "all" && r._expiry !== expiryFilter) return false;
      if (kindFilter !== "all" && r._kind !== kindFilter) return false;
      if (deptFilter) {
        const d = (r.student_department || r.invoice_department || "").toLowerCase();
        if (d !== deptFilter.toLowerCase()) return false;
      }
      if (q) {
        const searchable = [
          r._name,
          r.matric_number,
          r.target_id,
          r.application_number,
        ]
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [enriched, expiryFilter, kindFilter, deptFilter, search]);

  const handleRevoke = async (item) => {
    const { value: reason } = await Swal.fire({
      title: "Revoke Undertaking",
      text: `Revoking the undertaking for ${item._name} will remove their clearance cover. Provide a reason (optional):`,
      input: "text",
      inputPlaceholder: "Reason for revocation",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Revoke",
      confirmButtonColor: "#dc3545",
    });

    if (reason === undefined) return; // cancelled

    Swal.fire({ title: "Processing", allowOutsideClick: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });

    try {
      await request
        .post(`${baseUrl}/invoices/revoke_undertaking`)
        .type("application/json")
        .send({ id: item.id, reason: reason || "" });
      Swal.close();
      Toast.fire({ icon: "success", title: "Undertaking revoked" });
      fetchData();
    } catch (err) {
      Swal.close();
      Swal.fire("Error", err?.response?.body?.error || "Could not revoke", "error");
    }
  };

  const openExtend = (item) => {
    setExtendTarget({ id: item.id, name: item._name, currentDate: item.expected_clearance_date });
    setExtendDate(item.expected_clearance_date || "");
    setExtendNote("");
  };

  const submitExtend = async () => {
    if (!extendDate) {
      Toast.fire({ icon: "error", title: "Please select a new deadline date" });
      return;
    }
    setExtending(true);
    try {
      await request
        .post(`${baseUrl}/invoices/extend_undertaking_date`)
        .type("application/json")
        .send({ id: extendTarget.id, new_date: extendDate, note: extendNote });
      Toast.fire({ icon: "success", title: "Deadline extended" });
      setExtendTarget(null);
      fetchData();
    } catch (err) {
      Swal.fire("Error", err?.response?.body?.error || "Could not extend deadline", "error");
    } finally {
      setExtending(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Student Name", "Matric No", "Application No", "Email",
      "Department", "Type", "Invoice Code", "Amount (NGN)",
      "Deadline", "Days Remaining", "Expiry Status", "Reason",
    ];
    const rows = filtered.map((item) => [
      item._name,
      item.matric_number || "",
      getApplicationNo(item),
      item.target_id || "",
      item.student_department || item.invoice_department || "",
      item._kind,
      item.invoice_code || "",
      Number(item.amount || item.outstanding_snapshot || 0).toFixed(2),
      item.expected_clearance_date || "",
      item._days !== null ? item._days : "",
      EXPIRY_LABELS[item._expiry] || "",
      item.reason || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = `undertakings_tracker_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const renderDaysTag = (item) => {
    const days = item._days;
    if (days === null) return <span className="badge bg-secondary">No date</span>;
    if (days < 0)
      return <span className="badge bg-danger">{Math.abs(days)}d overdue</span>;
    if (days === 0)
      return <span className="badge bg-warning text-dark">Due today</span>;
    return (
      <span className={days <= EXPIRING_SOON_DAYS ? "badge bg-warning text-dark" : "badge bg-success"}>
        {days}d left
      </span>
    );
  };

  const FILTER_TABS = [
    { key: "all", label: `All (${stats.total})` },
    { key: "expired", label: `Expired (${stats.expired})` },
    { key: "expiring_soon", label: `Expiring Soon (${stats.expiring_soon})` },
    { key: "active", label: `Active (${stats.active})` },
    { key: "no_date", label: `No Date (${stats.no_date})` },
  ];

  return (
    <div className="container-fluid py-3">
      {/* Extend Deadline Modal */}
      {extendTarget && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => e.target === e.currentTarget && setExtendTarget(null)}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Extend Deadline</h5>
                <button type="button" className="btn-close" onClick={() => setExtendTarget(null)} />
              </div>
              <div className="modal-body">
                <p className="mb-2">
                  <strong>Student:</strong> {extendTarget.name}
                </p>
                <p className="mb-3 text-muted small">
                  Current deadline: {extendTarget.currentDate || "not set"}
                </p>
                <div className="mb-3">
                  <label className="form-label">New Deadline Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={extendDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setExtendDate(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Note (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Reason for extension"
                    value={extendNote}
                    onChange={(e) => setExtendNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setExtendTarget(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={submitExtend}
                  disabled={extending}
                >
                  {extending ? "Saving…" : "Save New Deadline"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          {/* Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h5 className="mb-0">Undertakings Tracker</h5>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-success btn-sm"
                onClick={handleExportCSV}
                disabled={loading || filtered.length === 0}
              >
                <i className="fas fa-download me-1"></i>Export CSV
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={fetchData}
                disabled={loading}
              >
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="row g-2 mb-3">
            {[
              { label: "Total Approved", value: stats.total, cls: "primary" },
              { label: "Expired", value: stats.expired, cls: "danger" },
              { label: "Expiring ≤7 days", value: stats.expiring_soon, cls: "warning" },
              { label: "Active", value: stats.active, cls: "success" },
              { label: "No Date Set", value: stats.no_date, cls: "secondary" },
            ].map((c) => (
              <div className="col-6 col-sm-4 col-md-2" key={c.label}>
                <div className={`card border-${c.cls} h-100 text-center py-2`}>
                  <div className={`fs-4 fw-bold text-${c.cls}`}>{c.value}</div>
                  <div className="small text-muted">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {FILTER_TABS.map((t) => (
              <button
                key={t.key}
                className={`btn btn-sm ${expiryFilter === t.key ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setExpiryFilter(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search + secondary filters */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search name, matric, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="financial">Financial</option>
                <option value="document">Document</option>
                <option value="stationary">Stationary</option>
              </select>
            </div>
            <div className="col-12 col-md-3 d-flex align-items-center">
              <span className="text-muted small">{filtered.length} record(s)</span>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive" style={{ maxHeight: "65vh" }}>
            <table className="table table-sm align-middle table-bordered">
              <thead className="table-light sticky-top">
                <tr>
                  <th>Student</th>
                  <th>Dept</th>
                  <th>Type</th>
                  <th>Invoice / Amount</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">Loading…</td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">No undertakings match the selected filters</td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((item) => (
                    <tr key={item.id} style={{ background: ROW_BG[item._expiry] }}>
                      <td>
                        <div className="fw-semibold">{item._name}</div>
                        <div className="text-muted small">
                          Matric: {item.matric_number || "-"}
                        </div>
                        <div className="text-muted small">
                          App: {getApplicationNo(item)}
                        </div>
                        <div className="text-muted small">{item.target_id}</div>
                      </td>
                      <td className="small">
                        {item.student_department || item.invoice_department || "-"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item._kind === "financial"
                              ? "bg-info text-dark"
                              : item._kind === "document"
                              ? "bg-primary"
                              : "bg-secondary"
                          }`}
                        >
                          {item._kind}
                        </span>
                      </td>
                      <td className="small">
                        <div>{item.invoice_code}</div>
                        {item._kind === "financial" && (
                          <div>Amt: {currency(item.amount || item.outstanding_snapshot)}</div>
                        )}
                      </td>
                      <td>
                        <div className="small mb-1">
                          {item.expected_clearance_date || <em className="text-muted">Not set</em>}
                        </div>
                        {renderDaysTag(item)}
                      </td>
                      <td>
                        <span className={EXPIRY_BADGE[item._expiry]}>
                          {EXPIRY_LABELS[item._expiry]}
                        </span>
                      </td>
                      <td
                        className="small"
                        title={item.reason || ""}
                        style={{
                          maxWidth: 140,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: item.reason ? "help" : "default",
                        }}
                      >
                        {item.reason || "-"}
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openExtend(item)}
                          >
                            Extend Deadline
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleRevoke(item)}
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
