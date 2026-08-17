import React, { useEffect, useState } from "react";
import request from "superagent";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../../components/errorNotifier";

const money = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number(value || 0));

const dateText = (value) => {
  if (!value) return "-";
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const badgeClass = (severity) =>
  severity === "critical"
    ? "badge bg-danger"
    : severity === "warning"
      ? "badge bg-warning text-dark"
      : severity === "info"
        ? "badge bg-info text-dark"
      : "badge bg-secondary";

const sourceLabel = (value) =>
  String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const requestTimeout = { response: 10000, deadline: 30000 };

const AccountReconciliation = () => {
  const [filters, setFilters] = useState({
    query: "",
    reference: "",
  });
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [correcting, setCorrecting] = useState("");
  const [data, setData] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [resetPreview, setResetPreview] = useState(null);

  const email = data?.student?.Email || filters.query;
  const issues = data?.issues || [];
  const matches = data?.paystack_matches || [];
  const paystackRows = matches.map((match) => match.paystack).filter(Boolean);
  const local = data?.local_state || {};

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const fetchStudents = async (search = studentSearch) => {
    try {
      setStudentsLoading(true);
      const response = await request
        .get(`${baseUrl}reconciliation/students`)
        .timeout(requestTimeout)
        .query({ search, limit: 80 });
      setStudents(Array.isArray(response.body?.data) ? response.body.data : []);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Unable to load students" });
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectStudent = (student) => {
    updateFilter("query", student.Email || "");
    setStudentSearch(student.Fullname || student.Email || "");
    setData(null);
    setResetPreview(null);
  };

  const scan = async () => {
    if (!filters.query.trim()) {
      Toast.fire({ icon: "error", title: "Enter student email, ID, or name" });
      return;
    }

    try {
      setLoading(true);
      const response = await request
        .post(`${baseUrl}reconciliation/scan`)
        .timeout({ response: 15000, deadline: 45000 })
        .type("application/json")
        .send(filters);
      setData(response.body?.data || null);
      setResetPreview(null);
      Toast.fire({ icon: "success", title: "Reconciliation scan complete" });
    } catch (err) {
      Toast.fire({
        icon: "error",
        title:
          err?.response?.body?.message ||
          "Unable to run reconciliation scan",
      });
    } finally {
      setLoading(false);
    }
  };

  const correction = async (payload, label) => {
    if (payload.force) {
      const ok = window.confirm(
        "This is an admin status decision. It changes the invoice status even if payment or settlement records disagree. Continue?",
      );
      if (!ok) return;
    }

    const reason = window.prompt(`Reason for ${label}`);
    if (!reason || !reason.trim()) return;

    try {
      setCorrecting(label);
      const response = await request
        .post(`${baseUrl}reconciliation/correction`)
        .timeout(requestTimeout)
        .type("application/json")
        .send({ ...payload, reason });
      const warnings = response.body?.warnings || [];
      Toast.fire({
        icon: warnings.length ? "warning" : "success",
        title: warnings.length
          ? `Correction applied with ${warnings.length} warning(s)`
          : "Correction applied",
      });
      await scan();
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.message || "Correction failed",
      });
    } finally {
      setCorrecting("");
    }
  };

  const importPaystackCredit = (match) =>
    correction(
      {
        action: "import_paystack_credit",
        email,
        paystack: match.paystack,
      },
      "Paystack credit import",
    );

  const fixLedgerAsCredit = (issue) =>
    correction(
      {
        action: "reclassify_ledger",
        entry_id: issue.local_id,
        direction: "credit",
      },
      "ledger credit reclassification",
    );

  const recalcInvoice = (issue) =>
    correction(
      {
        action: "recalc_invoice_status",
        email,
        invoice_code: issue.invoice_code,
      },
      "invoice status recalculation",
    );

  const confirmInvoicePaid = (issue) =>
    correction(
      {
        action: "confirm_invoice_paid",
        email,
        invoice_code: issue.invoice_code,
        paystack_reference: issue.reference,
      },
      "invoice paid confirmation",
    );

  const actionBusy = (label) => correcting === label;

  const buttonContent = (label, text) =>
    actionBusy(label) ? (
      <>
        <span
          className="spinner-border spinner-border-sm me-1"
          role="status"
          aria-hidden="true"
        />
        Processing...
      </>
    ) : (
      text
    );

  const setInvoiceStatus = (target, statusValue, force = false) => {
    const invoiceCode = target.invoice_code;
    const label = `${force ? "admin " : ""}set ${invoiceCode} ${statusValue}`;
    return correction(
      {
        action: "set_invoice_status",
        email,
        invoice_code: invoiceCode,
        status_value: statusValue,
        force,
      },
      label,
    );
  };

  const guardedSetInvoiceStatus = (issue, statusValue) =>
    correction(
      {
        action: "set_invoice_status",
        email,
        invoice_code: issue.invoice_code,
        status_value: statusValue,
      },
      `set invoice ${statusValue}`,
    );

  const repairInvoicePaymentTrail = (issue) =>
    correction(
      {
        action: "repair_invoice_item_payments_from_evidence",
        email,
        invoice_code: issue.invoice_code,
      },
      "invoice payment trail repair",
    );

  const runAutopaymentRepair = (issue = null) =>
    correction(
      {
        action: "run_autopayment_repair",
        email,
        invoice_code: issue?.invoice_code || "",
      },
      "autopayment repair",
    );

  const evidenceRows = (issue) => issue?.expected?.evidence || [];
  const funding = data?.summary?.funding_position || {};

  const rebuildWallet = () =>
    correction(
      {
        action: "rebuild_wallet_balance",
        email,
      },
      "wallet balance rebuild",
    );

  const previewAccountReset = async () => {
    if (!email) {
      Toast.fire({ icon: "error", title: "Select and scan a student first" });
      return;
    }

    try {
      setCorrecting("account reset preview");
      const response = await request
        .post(`${baseUrl}reconciliation/correction`)
        .timeout(requestTimeout)
        .type("application/json")
        .send({
          action: "preview_account_reset",
          email,
          reason: "Preview account financial reset",
        });
      setResetPreview(response.body || null);
      Toast.fire({ icon: "success", title: "Reset preview ready" });
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.message || "Unable to preview reset",
      });
    } finally {
      setCorrecting("");
    }
  };

  const executeAccountReset = () => {
    const confirmText = window.prompt(
      "Type RESET to confirm this student's financial reset",
    );
    if (String(confirmText || "").trim().toUpperCase() !== "RESET") {
      Toast.fire({ icon: "info", title: "Reset cancelled" });
      return;
    }

    correction(
      {
        action: "reset_student_account",
        email,
        confirmation: "RESET",
      },
      "student account financial reset",
    ).then(() => setResetPreview(null));
  };

  return (
    <div className="container-fluid py-4">
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
            <div>
              <h3 className="mb-1">Account Reconciliation</h3>
              <div className="text-muted">
                Trace Paystack inflow, wallet movement, and invoice settlement.
              </div>
            </div>
            {data && (
              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-outline-danger"
                  onClick={previewAccountReset}
                  disabled={Boolean(correcting)}
                >
                  {buttonContent("account reset preview", "Preview Reset")}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={rebuildWallet}
                  disabled={Boolean(correcting)}
                >
                  Rebuild Wallet Balance
                </button>
              </div>
            )}
          </div>

          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label">Selected Student</label>
              <input
                className="form-control"
                placeholder="Pick from list or type email, application no, matric no, name"
                value={filters.query}
                onChange={(e) => updateFilter("query", e.target.value)}
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">Paystack Reference / Customer Code</label>
              <input
                className="form-control"
                placeholder="Optional, e.g. reference or CUS_..."
                value={filters.reference}
                onChange={(e) => updateFilter("reference", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={scan}
                disabled={loading}
              >
                {loading ? "..." : "Scan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {correcting && (
        <div className="alert alert-warning d-flex align-items-center gap-2">
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
          <span>Processing {correcting}...</span>
        </div>
      )}

      {resetPreview && (
        <div className="card border-danger mb-4">
          <div className="card-header bg-danger text-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h5 className="mb-0">Account Financial Reset Preview</h5>
              <div className="small">
                This reverses paid/partial invoice payments, zeroes wallet, then allows Paystack reimport.
              </div>
            </div>
            <button
              className="btn btn-sm btn-light"
              onClick={() => setResetPreview(null)}
              disabled={Boolean(correcting)}
            >
              Close
            </button>
          </div>
          <div className="card-body">
            {!resetPreview.ready && (
              <div className="alert alert-warning">
                Reset migration/support is incomplete. Run{" "}
                <strong>MIGRATION_account_financial_reset.sql</strong> before executing reset.
              </div>
            )}
            {resetPreview.blocked && (
              <div className="alert alert-danger">
                {resetPreview.block_reason || "Reset is blocked."}
              </div>
            )}
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-muted small">Current Wallet</div>
                <div className="h5">{money(resetPreview.summary?.wallet_balance)}</div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small">Payments To Reverse</div>
                <div className="h5 text-danger">
                  {money(resetPreview.summary?.payment_total)}
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small">Wallet To Zero</div>
                <div className="h5 text-danger">
                  {money(resetPreview.summary?.wallet_zeroing_amount)}
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-muted small">After Reset Wallet</div>
                <div className="h5">{money(resetPreview.summary?.after_wallet)}</div>
              </div>
            </div>
            <div className="row g-3 mt-2">
              <div className="col-md-3">
                <div className="small text-muted">Affected Invoices</div>
                <strong>{resetPreview.summary?.invoice_count || 0}</strong>
              </div>
              <div className="col-md-3">
                <div className="small text-muted">Payment Rows</div>
                <strong>{resetPreview.summary?.payment_count || 0}</strong>
              </div>
              <div className="col-md-3">
                <div className="small text-muted">Settled Amount</div>
                <strong>{money(resetPreview.summary?.settled_payment_total)}</strong>
              </div>
              <div className="col-md-3">
                <div className="small text-muted">Pending Settlement Rows</div>
                <strong>{resetPreview.summary?.pending_settlement_count || 0}</strong>
              </div>
            </div>
            <div className="mt-3 d-flex flex-wrap gap-2">
              <button
                className="btn btn-danger"
                onClick={executeAccountReset}
                disabled={
                  Boolean(correcting) ||
                  !resetPreview.ready ||
                  resetPreview.blocked ||
                  Number(resetPreview.summary?.payment_count || 0) === 0
                }
              >
                {buttonContent(
                  "student account financial reset",
                  "Confirm Financial Reset",
                )}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setResetPreview(null)}
                disabled={Boolean(correcting)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 className="mb-0">Pick Student</h5>
            <div className="small text-muted">
              Select the student first, then run reconciliation.
            </div>
          </div>
          <div className="d-flex gap-2" style={{ minWidth: 360 }}>
            <input
              className="form-control"
              placeholder="Search name, email, matric, application..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchStudents(studentSearch);
              }}
            />
            <button
              className="btn btn-outline-primary"
              onClick={() => fetchStudents(studentSearch)}
              disabled={studentsLoading}
            >
              {studentsLoading ? "..." : "Find"}
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: 360 }}>
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Matric / Application</th>
                  <th>Programme</th>
                  <th className="text-end">Wallet</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentsLoading && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Loading students...
                    </td>
                  </tr>
                )}
                {!studentsLoading && students.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No students found.
                    </td>
                  </tr>
                )}
                {!studentsLoading &&
                  students.map((student) => {
                    const selected = filters.query === student.Email;
                    return (
                      <tr
                        key={student.Email}
                        className={selected ? "table-success" : ""}
                      >
                        <td className="fw-semibold">
                          {student.Fullname || student.Email}
                        </td>
                        <td>{student.Email}</td>
                        <td>
                          <div>{student.MatricNumber || "-"}</div>
                          <div className="small text-muted">
                            {student.ApplicationNo || "-"}
                          </div>
                        </td>
                        <td>
                          <div>{student.Programme || "-"}</div>
                          <div className="small text-muted">
                            {student.Department || "-"}
                          </div>
                        </td>
                        <td className="text-end">
                          {money(student.AccountBalance)}
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${
                              selected ? "btn-success" : "btn-outline-primary"
                            }`}
                            onClick={() => selectStudent(student)}
                          >
                            {selected ? "Selected" : "Pick"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {data && (
        <>
          <div className="alert alert-info">
            <strong>Student:</strong>{" "}
            {data.student?.Fullname || data.student?.Email || email} |{" "}
            <strong>Email:</strong> {email} | <strong>Wallet:</strong>{" "}
            {money(data.student?.AccountBalance)}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="text-muted small">Paystack Inflows</div>
                  <div className="h4 mb-0">
                    {data.summary?.paystack_success_count || 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="text-muted small">Ledger Entries</div>
                  <div className="h4 mb-0">{data.summary?.ledger_count || 0}</div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="text-muted small">Invoices</div>
                  <div className="h4 mb-0">
                    {data.summary?.invoice_count || 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="text-muted small">Open Issues</div>
                  <div
                    className={`h4 mb-0 ${
                      issues.length ? "text-danger" : "text-success"
                    }`}
                  >
                    {issues.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Funding Position</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="text-muted small">Paystack Inflow</div>
                  <div className="h5 text-success">
                    {money(funding.paystack_inflow_total)}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">Paid Invoice Total</div>
                  <div className="h5">{money(funding.paid_invoice_total)}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">Excess Over Paid</div>
                  <div className="h5 text-primary">
                    {money(funding.paystack_excess_over_paid_invoices)}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">Paid Above Inflow</div>
                  <div className="h5 text-danger">
                    {money(funding.paid_invoice_total_exceeds_paystack_by)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Discrepancies</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Issue</th>
                      <th>Reference / Invoice</th>
                      <th>Source</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!issues.length && (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No reconciliation issues detected.
                        </td>
                      </tr>
                    )}
                    {issues.map((issue, idx) => (
                      <tr key={`${issue.issue_type}-${idx}`}>
                        <td>
                          <span className={badgeClass(issue.severity)}>
                            {issue.severity}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold">{issue.issue_type}</div>
                          <div className="small text-muted">{issue.message}</div>
                          {issue.issue_type ===
                            "unpaid_invoice_has_payment_evidence" && (
                            <div className="small mt-2">
                              <div>
                                Required:{" "}
                                <strong>
                                  {money(issue.expected?.required_amount)}
                                </strong>{" "}
                                | Evidence:{" "}
                                <strong>
                                  {money(issue.expected?.evidence_amount)}
                                </strong>
                              </div>
                              {evidenceRows(issue).slice(0, 4).map((ev, i) => (
                                <div
                                  key={`${ev.kind}-${ev.reference}-${i}`}
                                  className="text-muted"
                                >
                                  {sourceLabel(ev.kind)}:{" "}
                                  {ev.reference || "-"} | {money(ev.amount)} |{" "}
                                  {ev.confidence} | {ev.reason}
                                </div>
                              ))}
                            </div>
                          )}
                          {issue.issue_type ===
                            "paystack_inflow_exceeds_paid_invoice_total" && (
                            <div className="small mt-2 text-muted">
                              Invoice:{" "}
                              <strong>
                                {money(issue.expected?.invoice_amount)}
                              </strong>{" "}
                              | Paystack excess:{" "}
                              <strong>
                                {money(
                                  issue.expected
                                    ?.paystack_excess_over_paid_invoices,
                                )}
                              </strong>{" "}
                              | Wallet:{" "}
                              <strong>
                                {money(issue.expected?.wallet_balance)}
                              </strong>
                            </div>
                          )}
                          {issue.issue_type ===
                            "paid_invoice_not_covered_by_paystack_inflow" && (
                            <div className="small mt-2 text-muted">
                              Invoice:{" "}
                              <strong>
                                {money(issue.expected?.invoice_amount)}
                              </strong>{" "}
                              | Paystack inflow:{" "}
                              <strong>
                                {money(issue.expected?.paystack_inflow_total)}
                              </strong>{" "}
                              | Paid invoices:{" "}
                              <strong>
                                {money(issue.expected?.paid_invoice_total)}
                              </strong>
                            </div>
                          )}
                          {issue.issue_type ===
                            "migration_wallet_balance_can_pay_unpaid_invoices" && (
                            <div className="small mt-2 text-muted">
                              Paystack inflow:{" "}
                              <strong>
                                {money(issue.expected?.paystack_inflow_total)}
                              </strong>{" "}
                              | Wallet:{" "}
                              <strong>
                                {money(issue.expected?.wallet_balance)}
                              </strong>{" "}
                              | Unpaid invoices:{" "}
                              <strong>
                                {money(issue.expected?.unpaid_invoice_total)}
                              </strong>
                              <div className="mt-1">
                                {issue.expected?.settlement_note}
                              </div>
                            </div>
                          )}
                        </td>
                        <td>
                          {issue.reference || issue.invoice_code || "-"}
                        </td>
                        <td>
                          {sourceLabel(issue.actual?.source_type)}
                          {issue.actual?.description && (
                            <div className="small text-muted">
                              {issue.actual.description}
                            </div>
                          )}
                        </td>
                        <td>
                          {issue.issue_type ===
                            "wallet_credit_recorded_as_debit" && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => fixLedgerAsCredit(issue)}
                              disabled={Boolean(correcting)}
                            >
                              Fix as Credit
                            </button>
                          )}
                          {issue.issue_type === "invoice_status_mismatch" && (
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => recalcInvoice(issue)}
                              disabled={Boolean(correcting)}
                            >
                              Recalculate Invoice
                            </button>
                          )}
                          {issue.issue_type ===
                            "unpaid_invoice_has_payment_evidence" && (
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => repairInvoicePaymentTrail(issue)}
                                disabled={Boolean(correcting)}
                              >
                                Repair Payment Trail
                              </button>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => confirmInvoicePaid(issue)}
                                disabled={Boolean(correcting)}
                              >
                                Confirm Paid
                              </button>
                            </div>
                          )}
                          {issue.issue_type ===
                            "paystack_inflow_exceeds_paid_invoice_total" && (
                            issue.invoice_code ? (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => runAutopaymentRepair(issue)}
                                disabled={Boolean(correcting)}
                              >
                                {buttonContent(
                                  "autopayment repair",
                                  "Run Invoice Payment",
                                )}
                              </button>
                            ) : (
                              <span className="badge bg-light text-dark">
                                Select invoice before wallet payment
                              </span>
                            )
                          )}
                          {issue.issue_type ===
                            "paid_invoice_not_covered_by_paystack_inflow" && (
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() =>
                                  guardedSetInvoiceStatus(issue, "Partial")
                                }
                                disabled={Boolean(correcting)}
                              >
                                Set Partial
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  guardedSetInvoiceStatus(issue, "Unpaid")
                                }
                                disabled={Boolean(correcting)}
                              >
                                Set Unpaid
                              </button>
                            </div>
                          )}
                          {issue.issue_type ===
                            "migration_wallet_balance_can_pay_unpaid_invoices" && (
                            issue.invoice_code ? (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => runAutopaymentRepair(issue)}
                                disabled={Boolean(correcting)}
                              >
                                {buttonContent(
                                  "autopayment repair",
                                  "Run Invoice Payment",
                                )}
                              </button>
                            ) : (
                              <span className="badge bg-light text-dark">
                                Select invoice before wallet payment
                              </span>
                            )
                          )}
                          {issue.issue_type ===
                            "local_credit_without_paystack_inflow" && (
                            <span className="badge bg-light text-dark">
                              Review source
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h5 className="mb-0">Pure Paystack Transactions</h5>
                <div className="small text-muted">
                  Raw successful Paystack inflows found for this student/reference scan.
                </div>
              </div>
              <span className="badge bg-primary">{paystackRows.length} row(s)</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Paid At</th>
                      <th>Customer</th>
                      <th>Channel</th>
                      <th className="text-end">Gross</th>
                      <th className="text-end">Fees</th>
                      <th className="text-end">Net</th>
                      <th>Status</th>
                      <th>Instrument</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!paystackRows.length && (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-muted">
                          No pure Paystack transaction found for this scan.
                        </td>
                      </tr>
                    )}
                    {paystackRows.map((row) => (
                      <tr key={row.reference}>
                        <td className="fw-semibold">{row.reference}</td>
                        <td>{dateText(row.paid_at)}</td>
                        <td>
                          <div>{row.customer_email || "-"}</div>
                          <div className="small text-muted">
                            {row.customer_code || "-"}
                          </div>
                        </td>
                        <td>{row.channel || "-"}</td>
                        <td className="text-end">{money(row.gross_amount)}</td>
                        <td className="text-end">{money(row.fees)}</td>
                        <td className="text-end text-success fw-semibold">
                          {money(row.amount)}
                        </td>
                        <td>
                          <span className="badge bg-success">
                            {row.status || "success"}
                          </span>
                        </td>
                        <td>
                          <div>{row.bank || row.card_type || "-"}</div>
                          <div className="small text-muted">
                            {row.last4 ? `**** ${row.last4}` : row.gateway_response || "-"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Paystack Inflow Matching</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Paid At</th>
                      <th className="text-end">Net Amount</th>
                      <th>Best Local Match</th>
                      <th>Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!matches.length && (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No Paystack inflow found for this scan.
                        </td>
                      </tr>
                    )}
                    {matches.map((match) => {
                        const canImport =
                          match.needs_reset_reimport ||
                          !match.best_match ||
                          match.score < 55;
                        const importLabel = match.needs_reset_reimport
                          ? "Reimport Credit"
                          : "Import Credit";
                        const correctionLabel = "Paystack credit import";

                        return (
                          <tr key={match.paystack?.reference}>
                            <td className="fw-semibold">
                              {match.paystack?.reference}
                            </td>
                            <td>{dateText(match.paystack?.paid_at)}</td>
                            <td className="text-end">
                              {money(match.paystack?.amount)}
                            </td>
                            <td>
                              {match.best_match ? (
                                <>
                                  <div>{match.best_match.kind}</div>
                                  <div className="small text-muted">
                                    {match.best_match.reference} |{" "}
                                    {money(match.best_match.amount)}
                                  </div>
                                </>
                              ) : (
                                <span className="text-danger">
                                  No local match
                                </span>
                              )}
                              {match.needs_reset_reimport && (
                                <div className="small text-warning fw-semibold">
                                  Needs reimport after reset
                                </div>
                              )}
                            </td>
                            <td>{match.score}</td>
                            <td>
                              {canImport && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => importPaystackCredit(match)}
                                  disabled={Boolean(correcting)}
                                >
                                  {buttonContent(correctionLabel, importLabel)}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">Wallet Ledger</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive" style={{ maxHeight: 460 }}>
                    <table className="table table-sm table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Reference</th>
                          <th>Source</th>
                          <th>Description</th>
                          <th className="text-end text-success">Credit</th>
                          <th className="text-end text-danger">Debit</th>
                          <th className="text-end">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(local.ledger || []).map((row) => (
                          <tr key={row.id}>
                            <td>{dateText(row.entry_date)}</td>
                            <td>{row.reference}</td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {sourceLabel(row.source_type)}
                              </span>
                            </td>
                            <td style={{ minWidth: 240 }}>
                              {row.description || "-"}
                            </td>
                            <td className="text-end text-success">
                              {Number(row.credit_amount) > 0
                                ? money(row.credit_amount)
                                : "-"}
                            </td>
                            <td className="text-end text-danger">
                              {Number(row.debit_amount) > 0
                                ? money(row.debit_amount)
                                : "-"}
                            </td>
                            <td className="text-end">
                              {row.balance_after === null
                                ? "-"
                                : money(row.balance_after)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0">Invoice Settlement</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive" style={{ maxHeight: 460 }}>
                    <table className="table table-sm table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Invoice</th>
                          <th>Title</th>
                          <th className="text-end">Amount</th>
                          <th>Status</th>
                          <th>Admin Decision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(local.invoices || []).map((row) => {
                          const status = String(row.status || "").toLowerCase();
                          const paidLabel = `admin set ${row.invoice_code} Paid`;
                          const partialLabel = `admin set ${row.invoice_code} Partial`;
                          const unpaidLabel = `admin set ${row.invoice_code} Unpaid`;
                          const isCanceled =
                            status === "canceled" || status === "cancelled";

                          return (
                            <tr key={row.id}>
                              <td>{row.invoice_code}</td>
                              <td>{row.title}</td>
                              <td className="text-end">{money(row.amount)}</td>
                              <td>
                                <span className="badge bg-secondary">
                                  {row.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() =>
                                      setInvoiceStatus(row, "Paid", true)
                                    }
                                    disabled={
                                      Boolean(correcting) ||
                                      status === "paid" ||
                                      isCanceled
                                    }
                                  >
                                    {buttonContent(paidLabel, "Paid")}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() =>
                                      setInvoiceStatus(row, "Partial", true)
                                    }
                                    disabled={
                                      Boolean(correcting) ||
                                      status === "partial" ||
                                      isCanceled
                                    }
                                  >
                                    {buttonContent(partialLabel, "Partial")}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      setInvoiceStatus(row, "Unpaid", true)
                                    }
                                    disabled={
                                      Boolean(correcting) ||
                                      status === "unpaid" ||
                                      isCanceled
                                    }
                                  >
                                    {buttonContent(unpaidLabel, "Unpaid")}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountReconciliation;
