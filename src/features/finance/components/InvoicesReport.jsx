import React, { useState, useEffect, useMemo } from "react";
import { Toast } from "../../../components/errorNotifier";
import { loader } from "../../../components/LoadingSpinner";
import { baseUrl } from "../../../services/setup";
import request from "superagent";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const INVOICE_REPORT_CACHE_TTL_MS = 5 * 60 * 1000;
const STUDENTS_PER_PAGE = 50;
let invoiceReportCache = {
  data: null,
  fetchedAt: 0,
};

const InvoicesReport = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingCode, setCancellingCode] = useState("");
  const [expandedEmails, setExpandedEmails] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState({
    startDate: "",
    endDate: "",
    status: "all",
    searchQuery: "",
  });
  const [extraFilters, setExtraFilters] = useState({
    department: "",
    programme: "",
    session: "",
  });
  const [filterLists, setFilterLists] = useState({
    departments: [],
    programmes: [],
    sessions: [],
  });
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalInvoices: 0,
  });

  useEffect(() => {
    fetchInvoices();
  }, []);
  useEffect(() => {
    filterInvoices();
  }, [filterOptions, invoices, extraFilters]);
  useEffect(() => {
    setCurrentPage(1);
    setExpandedEmails(new Set());
  }, [filterOptions, extraFilters]);

  const applyInvoiceData = (data) => {
    setFilterLists({
      departments: Array.from(
        new Set(data.map((i) => i.Department || i.department).filter(Boolean)),
      ),
      programmes: Array.from(
        new Set(data.map((i) => i.Programme || i.programme).filter(Boolean)),
      ),
      sessions: Array.from(
        new Set(data.map((i) => i.sessionOfEntry).filter(Boolean)),
      ),
    });
    setInvoices(data);
    calculateStats(data);
  };

  const fetchInvoices = async ({ force = false, quiet = false } = {}) => {
    const cachedData = invoiceReportCache.data;
    const cacheIsFresh =
      cachedData &&
      Date.now() - invoiceReportCache.fetchedAt < INVOICE_REPORT_CACHE_TTL_MS;

    if (!force && cacheIsFresh) {
      applyInvoiceData(cachedData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await request
        .get(`${baseUrl}/invoices/get_invoices_report`)
        .query({ limit: 500 })
        .timeout({ response: 15000, deadline: 60000 });
      const data = Array.isArray(response.body?.data) ? response.body.data : [];
      invoiceReportCache = {
        data,
        fetchedAt: Date.now(),
      };
      applyInvoiceData(data);
      setLoading(false);
      if (!quiet) {
        Toast.fire({ icon: "success", title: "Invoices fetched successfully" });
      }
    } catch (err) {
      const message =
        err?.response?.body?.message ||
        err?.response?.body?.error ||
        err?.message ||
        "Failed to fetch invoices";
      Toast.fire({ icon: "error", title: message });
      setLoading(false);
    }
  };

  const normalizeStatus = (status) =>
    String(status || "")
      .trim()
      .toLowerCase();

  // Mutate local state and cache instead of re-fetching the full report on every action.
  const removeInvoiceFromState = (invoiceCode, targetId) => {
    const match = (inv) =>
      inv.invoice_code === invoiceCode &&
      (inv.target_id || "").toLowerCase().trim() ===
        (targetId || "").toLowerCase().trim();
    setInvoices((prev) => prev.filter((inv) => !match(inv)));
    if (invoiceReportCache.data)
      invoiceReportCache.data = invoiceReportCache.data.filter(
        (inv) => !match(inv),
      );
  };

  const updateInvoiceInState = (invoiceCode, targetId, updates) => {
    const match = (inv) =>
      inv.invoice_code === invoiceCode &&
      (inv.target_id || "").toLowerCase().trim() ===
        (targetId || "").toLowerCase().trim();
    setInvoices((prev) =>
      prev.map((inv) => (match(inv) ? { ...inv, ...updates } : inv)),
    );
    if (invoiceReportCache.data)
      invoiceReportCache.data = invoiceReportCache.data.map((inv) =>
        match(inv) ? { ...inv, ...updates } : inv,
      );
  };

  const calculateStats = (data) => {
    const s = data.reduce(
      (acc, inv) => ({
        totalAmount: acc.totalAmount + parseFloat(inv.amount || 0),
        paidAmount:
          acc.paidAmount +
          (normalizeStatus(inv.status) === "paid"
            ? parseFloat(inv.amount || 0)
            : 0),
        pendingAmount:
          acc.pendingAmount +
          (normalizeStatus(inv.status) === "unpaid"
            ? parseFloat(inv.amount || 0)
            : 0),
        totalInvoices: acc.totalInvoices + 1,
      }),
      { totalAmount: 0, paidAmount: 0, pendingAmount: 0, totalInvoices: 0 },
    );
    setStats(s);
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    if (filterOptions.startDate && filterOptions.endDate) {
      filtered = filtered.filter((inv) => {
        const d = new Date(inv.invoice_date || inv.date);
        return (
          d >= new Date(filterOptions.startDate) &&
          d <= new Date(filterOptions.endDate)
        );
      });
    }
    if (filterOptions.status !== "all") {
      filtered = filtered.filter(
        (inv) =>
          normalizeStatus(inv.status) === normalizeStatus(filterOptions.status),
      );
    }
    if (filterOptions.searchQuery) {
      const q = filterOptions.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          (inv.Fullname || "").toLowerCase().includes(q) ||
          (inv.ApplicationNo || "").toLowerCase().includes(q) ||
          (inv.target_id || "").toLowerCase().includes(q) ||
          (inv.MatricNumber || "").toLowerCase().includes(q),
      );
    }
    if (extraFilters.department)
      filtered = filtered.filter(
        (inv) => (inv.Department || inv.department) === extraFilters.department,
      );
    if (extraFilters.programme)
      filtered = filtered.filter(
        (inv) => (inv.Programme || inv.programme) === extraFilters.programme,
      );
    if (extraFilters.session)
      filtered = filtered.filter(
        (inv) =>
          (inv.sessionOfEntry || inv.SessionOfEntry) === extraFilters.session,
      );
    calculateStats(filtered);
    setFilteredInvoices(filtered);
  };

  const studentGroups = useMemo(() => {
    const map = {};
    filteredInvoices.forEach((inv) => {
      const email = (inv.target_id || "").toLowerCase().trim();
      if (!email) return;
      if (!map[email]) {
        map[email] = {
          email,
          Fullname: inv.Fullname || "â€”",
          MatricNumber: inv.MatricNumber || "â€”",
          ApplicationNo: inv.ApplicationNo || "â€”",
          AccountBalance: inv.AccountBalance,
          Programme: inv.programme || inv.Programme || "â€”",
          sessionOfEntry: inv.sessionOfEntry || "â€”",
          invoices: [],
          paidCount: 0,
          unpaidCount: 0,
          partialCount: 0,
          cancelledCount: 0,
          totalAmount: 0,
        };
      }
      map[email].invoices.push(inv);
      const st = normalizeStatus(inv.status);
      const md = normalizeStatus(inv.mode);
      if (st === "paid") map[email].paidCount++;
      else if (st === "partial") map[email].partialCount++;
      else if (st === "canceled" || st === "cancelled" || md === "canceled")
        map[email].cancelledCount++;
      else map[email].unpaidCount++;
      map[email].totalAmount += parseFloat(inv.amount || 0);
    });
    return Object.values(map).sort((a, b) =>
      (a.Fullname || "").localeCompare(b.Fullname || ""),
    );
  }, [filteredInvoices]);

  const totalPages = Math.max(
    1,
    Math.ceil(studentGroups.length / STUDENTS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * STUDENTS_PER_PAGE;
  const visibleStudentGroups = studentGroups.slice(
    pageStartIndex,
    pageStartIndex + STUDENTS_PER_PAGE,
  );

  const toggleExpand = (email) => {
    setExpandedEmails((prev) => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  };

  const expandAll = () =>
    setExpandedEmails(new Set(visibleStudentGroups.map((g) => g.email)));
  const collapseAll = () => setExpandedEmails(new Set());

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions((prev) => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);

  const isCanceled = (inv) =>
    normalizeStatus(inv?.mode) === "canceled" ||
    normalizeStatus(inv?.status) === "canceled" ||
    normalizeStatus(inv?.status) === "cancelled";

  const statusBadge = (status) => {
    switch (normalizeStatus(status)) {
      case "paid":
        return <span className="badge bg-success">Paid</span>;
      case "partial":
        return <span className="badge bg-warning text-dark">Partial</span>;
      case "canceled":
      case "cancelled":
        return <span className="badge bg-secondary">Cancelled</span>;
      default:
        return <span className="badge bg-danger">Unpaid</span>;
    }
  };

  const handleViewInvoice = (inv) =>
    navigate("/admin/view-invoice", { state: { invoiceData: inv } });
  const handleEditInvoice = (inv) =>
    navigate("/admin/edit-invoice", { state: { invoiceData: inv } });

  const handleCancelInvoice = async (inv) => {
    if (!inv?.invoice_code) return;
    const { value } = await Swal.fire({
      title: "Cancel Invoice",
      text: `Type "cancel" to cancel invoice: ${inv.invoice_code}`,
      input: "text",
      inputPlaceholder: "Type cancel",
      showCancelButton: true,
      confirmButtonText: "Cancel Invoice",
      confirmButtonColor: "#ff9800",
      preConfirm: (v) => {
        if (String(v || "").toLowerCase() !== "cancel")
          Swal.showValidationMessage('You must type "cancel" to proceed');
      },
    });
    if (String(value || "").toLowerCase() !== "cancel") return;
    try {
      setCancellingCode(inv.invoice_code);
      loader({ title: "Cancelling!", text: "Please wait." });
      const res = await request
        .post(baseUrl + "invoices/cancel_invoice")
        .timeout({ response: 10000, deadline: 30000 })
        .withCredentials()
        .type("application/json")
        .send({ invoiceCode: inv.invoice_code });
      Swal.close();
      Toast.fire({
        icon: "success",
        title: "Invoice cancelled",
        text: res.body?.message,
      });
      updateInvoiceInState(inv.invoice_code, inv.target_id, {
        status: "canceled",
        mode: "canceled",
      });
    } catch (err) {
      Swal.close();
      const e = err.response?.body;
      Swal.fire({
        title: "Error!",
        text: e?.message || e?.error || "Failed to cancel invoice",
        icon: "error",
      });
    } finally {
      setCancellingCode("");
    }
  };

  const canRefundInvoice = (inv) =>
    ["paid", "partial"].includes(normalizeStatus(inv?.status)) &&
    !isCanceled(inv);

  const handleRefundInvoiceToWallet = async (inv) => {
    if (!inv?.invoice_code || !inv?.target_id) return;

    const { value } = await Swal.fire({
      title: "Refund invoice funds to wallet",
      html: `
        <div style="text-align:left">
          <p>This will remove successful payments from invoice <b>${inv.invoice_code}</b> and return the funds to <b>${inv.target_id}</b>'s wallet.</p>
          <p>The invoice will become <b>Unpaid</b> after the refund.</p>
          <p>Type <b>refund</b> to continue.</p>
        </div>
      `,
      input: "text",
      inputPlaceholder: "Type refund",
      showCancelButton: true,
      confirmButtonText: "Refund to Wallet",
      confirmButtonColor: "#dc3545",
      preConfirm: (v) => {
        if (String(v || "").toLowerCase() !== "refund") {
          Swal.showValidationMessage('You must type "refund" to proceed');
        }
      },
    });

    if (String(value || "").toLowerCase() !== "refund") return;

    try {
      setCancellingCode(inv.invoice_code);
      loader({
        title: "Refunding",
        text: "Returning invoice funds to wallet...",
      });
      const res = await request
        .post(baseUrl + "invoices/refund_invoice_to_wallet")
        .timeout({ response: 10000, deadline: 45000 })
        .withCredentials()
        .type("application/json")
        .send({
          invoiceCode: inv.invoice_code,
          target_id: inv.target_id,
          reason:
            "Wrong invoice allocation refunded to wallet from invoices report",
        });

      Swal.close();
      Toast.fire({
        icon: "success",
        title: "Refunded to wallet",
        text: `Amount: ${formatCurrency(res.body?.refunded_total || 0)}`,
      });
      updateInvoiceInState(inv.invoice_code, inv.target_id, {
        status: "Unpaid",
        payment_amount: 0,
      });
    } catch (err) {
      Swal.close();
      const e = err.response?.body;
      Swal.fire({
        title: "Refund Failed",
        text: e?.message || e?.error || "Unable to refund invoice to wallet",
        icon: "error",
      });
    } finally {
      setCancellingCode("");
    }
  };

  // Deletes any invoice: cancels it first if not already cancelled, then removes the row.
  const handleDirectDeleteInvoice = async (inv) => {
    if (!inv?.invoice_code || !inv?.target_id) return;
    const alreadyCancelled = isCanceled(inv);
    const hasPaid = ["paid", "partial"].includes(normalizeStatus(inv?.status));
    const { value } = await Swal.fire({
      title: "Delete Invoice",
      html: `
        <div style="text-align:left">
          <p>Remove <b>${inv.invoice_code}</b> from <b>${inv.target_id}</b>'s account.</p>
          ${!alreadyCancelled ? "<p>The invoice will be <b>cancelled first</b>, then permanently removed.</p>" : ""}
          ${hasPaid ? '<p style="color:#dc3545"><b>Warning:</b> This invoice has payment records. Consider refunding first.</p>' : ""}
          <p>Type <b>delete</b> to confirm.</p>
        </div>`,
      input: "text",
      inputPlaceholder: "Type delete",
      showCancelButton: true,
      confirmButtonText: "Delete Invoice",
      confirmButtonColor: "#dc3545",
      preConfirm: (v) => {
        if (String(v || "").toLowerCase() !== "delete")
          Swal.showValidationMessage('You must type "delete" to proceed');
      },
    });
    if (String(value || "").toLowerCase() !== "delete") return;
    try {
      setCancellingCode(inv.invoice_code);
      if (!alreadyCancelled) {
        loader({
          title: "Cancelling",
          text: "Cancelling invoice before deletion...",
        });
        await request
          .post(baseUrl + "invoices/cancel_invoice")
          .timeout({ response: 10000, deadline: 30000 })
          .withCredentials()
          .type("application/json")
          .send({ invoiceCode: inv.invoice_code });
      }
      loader({ title: "Deleting", text: "Removing invoice row..." });
      await request
        .post(baseUrl + "invoices/delete_canceled_invoice_for_student")
        .timeout({ response: 10000, deadline: 30000 })
        .withCredentials()
        .type("application/json")
        .send({
          invoiceCode: inv.invoice_code,
          target_id: inv.target_id,
          reason: "Direct delete from invoices report",
        });
      Swal.close();
      removeInvoiceFromState(inv.invoice_code, inv.target_id);
      Toast.fire({ icon: "success", title: "Invoice deleted" });
    } catch (err) {
      Swal.close();
      const e = err.response?.body;
      const detail =
        e?.message ||
        e?.error ||
        err.response?.text ||
        err.message ||
        "Delete failed";
      Swal.fire({ title: "Delete Failed", text: detail, icon: "error" });
    } finally {
      setCancellingCode("");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Matric No",
      "Email",
      "Invoice Code",
      "Title",
      "Amount",
      "Status",
      "Due Date",
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.Fullname || "",
      inv.MatricNumber || "",
      inv.target_id || "",
      inv.invoice_code || "",
      inv.title || "",
      parseFloat(inv.amount || 0).toFixed(2),
      inv.status || "",
      inv.due_date || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    link.download = `invoices_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card">
          <div className="card-body text-center py-5">
            <div
              className="spinner-border text-success mb-3"
              role="status"
              aria-hidden="true"
            />
            <div className="fw-semibold">Loading invoices...</div>
            <div className="text-muted small">
              Preparing the report without blocking the admin page.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Stats */}
      <div className="row mb-4 g-3">
        {[
          { label: "Students", value: studentGroups.length, color: "primary" },
          {
            label: "Total Invoices",
            value: stats.totalInvoices,
            color: "secondary",
          },
          {
            label: "Total Amount",
            value: formatCurrency(stats.totalAmount),
            color: "success",
          },
          {
            label: "Paid",
            value: formatCurrency(stats.paidAmount),
            color: "info",
          },
          {
            label: "Outstanding",
            value: formatCurrency(stats.pendingAmount),
            color: "warning",
          },
        ].map((s) => (
          <div key={s.label} className="col-6 col-md-4 col-lg">
            <div className={`card bg-${s.color} text-white h-100`}>
              <div className="card-body py-3">
                <div className="small">{s.label}</div>
                <div className="fw-bold fs-5">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                name="startDate"
                value={filterOptions.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                name="endDate"
                value={filterOptions.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Invoice Status</label>
              <select
                className="form-select"
                name="status"
                value={filterOptions.status}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
                <option value="canceled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Search student / email</label>
              <input
                type="text"
                className="form-control"
                placeholder="Name, matric, emailâ€¦"
                name="searchQuery"
                value={filterOptions.searchQuery}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={extraFilters.department}
                onChange={(e) =>
                  setExtraFilters((p) => ({ ...p, department: e.target.value }))
                }
              >
                <option value="">All Departments</option>
                {filterLists.departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Programme</label>
              <select
                className="form-select"
                value={extraFilters.programme}
                onChange={(e) =>
                  setExtraFilters((p) => ({ ...p, programme: e.target.value }))
                }
              >
                <option value="">All Programmes</option>
                {filterLists.programmes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Session</label>
              <select
                className="form-select"
                value={extraFilters.session}
                onChange={(e) =>
                  setExtraFilters((p) => ({ ...p, session: e.target.value }))
                }
              >
                <option value="">All Sessions</option>
                {filterLists.sessions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Student accordion list */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0">
            Students with Invoices
            <span className="badge bg-secondary ms-2">
              {studentGroups.length}
            </span>
            <span className="badge bg-light text-dark ms-2">
              Showing {studentGroups.length === 0 ? 0 : pageStartIndex + 1}-
              {Math.min(
                pageStartIndex + STUDENTS_PER_PAGE,
                studentGroups.length,
              )}
            </span>
          </h5>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={expandAll}
            >
              Expand Page
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={collapseAll}
            >
              Collapse All
            </button>
            <button
              className="btn btn-sm btn-success"
              onClick={handleExportCSV}
              disabled={!filteredInvoices.length}
            >
              <i className="fas fa-download me-1"></i>Export CSV
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          {studentGroups.length === 0 && (
            <div className="p-4 text-center text-muted">
              No students match the current filters.
            </div>
          )}

          {visibleStudentGroups.map((group) => {
            const isOpen = expandedEmails.has(group.email);
            return (
              <div key={group.email} className="border-bottom">
                {/* Student row */}
                <div
                  className="d-flex align-items-center gap-3 px-4 py-3 user-select-none"
                  style={{
                    cursor: "pointer",
                    background: isOpen ? "#f0f7f4" : "white",
                  }}
                  onClick={() => toggleExpand(group.email)}
                >
                  <i
                    className={`fas fa-chevron-${isOpen ? "down" : "right"} text-muted`}
                    style={{ width: 14 }}
                  />

                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-success text-white fw-bold flex-shrink-0"
                    style={{ width: 38, height: 38, fontSize: 15 }}
                  >
                    {(group.Fullname || "?")[0].toUpperCase()}
                  </div>

                  <div className="flex-grow-1 min-w-0">
                    <div className="fw-semibold">{group.Fullname}</div>
                    <div className="small text-muted text-truncate">
                      {group.email}
                      {group.MatricNumber !== "â€”" && (
                        <> &middot; {group.MatricNumber}</>
                      )}
                      {group.sessionOfEntry !== "â€”" && (
                        <> &middot; {group.sessionOfEntry}</>
                      )}
                      {group.Programme !== "â€”" && (
                        <> &middot; {group.Programme}</>
                      )}
                    </div>
                  </div>

                  <div
                    className="text-end d-none d-md-block flex-shrink-0"
                    style={{ minWidth: 110 }}
                  >
                    <div className="small text-muted">Balance</div>
                    <div className="fw-semibold">
                      {formatCurrency(group.AccountBalance)}
                    </div>
                  </div>

                  <div
                    className="d-flex gap-1 flex-shrink-0 flex-wrap justify-content-end"
                    style={{ minWidth: 160 }}
                  >
                    {group.paidCount > 0 && (
                      <span className="badge bg-success">
                        {group.paidCount} Paid
                      </span>
                    )}
                    {group.partialCount > 0 && (
                      <span className="badge bg-warning text-dark">
                        {group.partialCount} Partial
                      </span>
                    )}
                    {group.unpaidCount > 0 && (
                      <span className="badge bg-danger">
                        {group.unpaidCount} Unpaid
                      </span>
                    )}
                    {group.cancelledCount > 0 && (
                      <span className="badge bg-secondary">
                        {group.cancelledCount} Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded invoices */}
                {isOpen && (
                  <div className="px-4 pb-3" style={{ background: "#f8fdf9" }}>
                    <table className="table table-sm table-hover mb-0 mt-2">
                      <thead className="table-light">
                        <tr>
                          <th>Invoice Code</th>
                          <th>Title</th>
                          <th>Amount</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.invoices.map((inv) => (
                          <tr key={inv.id || inv.invoice_code}>
                            <td className="font-monospace small">
                              {inv.invoice_code}
                            </td>
                            <td>{inv.title || "â€”"}</td>
                            <td>{formatCurrency(inv.amount)}</td>
                            <td className="small">{inv.due_date || "â€”"}</td>
                            <td>
                              {statusBadge(
                                isCanceled(inv) ? "canceled" : inv.status,
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-1 flex-wrap">
                                <button
                                  className="btn btn-sm btn-primary py-0 px-2"
                                  onClick={() => handleViewInvoice(inv)}
                                >
                                  View
                                </button>
                                <button
                                  className="btn btn-sm btn-info py-0 px-2"
                                  onClick={() => handleEditInvoice(inv)}
                                  disabled={isCanceled(inv)}
                                >
                                  Edit
                                </button>
                                {canRefundInvoice(inv) && (
                                  <button
                                    className="btn btn-sm btn-warning py-0 px-2"
                                    onClick={() =>
                                      handleRefundInvoiceToWallet(inv)
                                    }
                                    disabled={
                                      cancellingCode === inv.invoice_code
                                    }
                                  >
                                    Refund
                                  </button>
                                )}
                                {!isCanceled(inv) && (
                                  <button
                                    className="btn btn-sm btn-outline-warning py-0 px-2"
                                    onClick={() => handleCancelInvoice(inv)}
                                    disabled={
                                      cancellingCode === inv.invoice_code
                                    }
                                  >
                                    {cancellingCode === inv.invoice_code
                                      ? "\u2026"
                                      : "Cancel"}
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-danger py-0 px-2"
                                  onClick={() => handleDirectDeleteInvoice(inv)}
                                  disabled={cancellingCode === inv.invoice_code}
                                >
                                  {cancellingCode === inv.invoice_code
                                    ? "\u2026"
                                    : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-light">
                          <td colSpan={2} className="fw-semibold small">
                            Total
                          </td>
                          <td className="fw-semibold">
                            {formatCurrency(group.totalAmount)}
                          </td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {studentGroups.length > STUDENTS_PER_PAGE && (
          <div className="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="small text-muted">
              Page {safeCurrentPage} of {totalPages} · {STUDENTS_PER_PAGE}{" "}
              students per page
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  collapseAll();
                  setCurrentPage((page) => Math.max(1, page - 1));
                }}
                disabled={safeCurrentPage <= 1}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  collapseAll();
                  setCurrentPage((page) => Math.min(totalPages, page + 1));
                }}
                disabled={safeCurrentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesReport;
