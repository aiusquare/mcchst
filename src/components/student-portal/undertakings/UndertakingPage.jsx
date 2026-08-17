import React, { useEffect, useMemo, useState } from "react";
import request from "superagent";
import Swal from "sweetalert2";
import { Toast } from "../../errorNotifier";
import { baseUrl } from "../../../services/setup";
import { formatCurrency } from "../../../utils/formatCurrency";

const DEFAULT_REASON = "Undertaking request";
const APPROVED_STATUSES = ["approved", "completed"];
const isPaid = (status) => (status || "").toLowerCase() === "paid";

const UndertakingPage = () => {
  const userEmail = localStorage.getItem("userEmail");
  const [wallet, setWallet] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [docStatus, setDocStatus] = useState([]);
  const [undertakingList, setUndertakingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expectedDate, setExpectedDate] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [requestingReapplication, setRequestingReapplication] =
    useState(false);
  const [clearanceSummary, setClearanceSummary] = useState(null);

  useEffect(() => {
    fetchFinancialData();
    fetchDocumentData();
    fetchUndertakingList();
    fetchClearanceSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClearanceSummary = async () => {
    try {
      const res = await request
        .post(baseUrl + "clearance/get")
        .type("application/json")
        .send({ email: userEmail, role: "student" });
      setClearanceSummary(res.body?.summary || null);
    } catch (err) {
      setClearanceSummary(null);
    }
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [invRes, balRes] = await Promise.all([
        request
          .post(baseUrl + "invoices/get_invoices_by_email/")
          .type("application/json")
          .send({ email: userEmail }),
        request
          .post(baseUrl + "user/get_std_wallet_balance/")
          .type("application/json")
          .send({ email: userEmail }),
      ]);

      const invData = Array.isArray(invRes.body) ? invRes.body : [];
      setInvoices(invData);

      const bal =
        balRes.body?.balance ??
        balRes.body?.AccountBalance ??
        balRes.body?.AccountBalance;
      setWallet(parseFloat(bal) || 0);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Failed to load invoices/wallet" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentData = async () => {
    try {
      const res = await request
        .post(baseUrl + "invoices/document_undertaking_status")
        .type("application/json")
        .send({ target_id: userEmail });

      setDocStatus(res.body?.data || []);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Failed to load documents" });
    }
  };

  const fetchUndertakingList = async () => {
    try {
      const res = await request
        .post(baseUrl + "invoices/student_undertaking_status")
        .type("application/json")
        .send({ target_id: userEmail });
      setUndertakingList(res.body?.data || []);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Failed to load undertaking status" });
    }
  };

  const outstandingTotal = useMemo(() => {
    return invoices
      .filter((inv) => !isPaid(inv.status))
      .reduce((sum, inv) => {
        const waiver = parseFloat(inv.waiver) || 0;
        const amt = parseFloat(inv.amount) || 0;
        return sum + Math.max(0, amt - waiver);
      }, 0);
  }, [invoices]);

  const unpaidInvoices = useMemo(
    () => invoices.filter((inv) => !isPaid(inv.status)),
    [invoices]
  );

  const pendingDocs = useMemo(
    () => docStatus.filter((doc) => !doc.submitted),
    [docStatus]
  );

  const pendingDocNames = useMemo(
    () => pendingDocs.map((doc) => doc.doc_name || doc.name),
    [pendingDocs]
  );

  const hasMissingDocs = pendingDocs.length > 0;

  useEffect(() => {
    setSelectedDocs((prev) => {
      const cleaned = prev.filter((name) =>
        pendingDocs.some((doc) => (doc.doc_name || doc.name) === name)
      );
      if (cleaned.length === 0 && pendingDocNames.length > 0) {
        return pendingDocNames;
      }
      return cleaned;
    });
  }, [pendingDocs, pendingDocNames]);

  useEffect(() => {
    const firstUnpaid = unpaidInvoices[0] || null;
    const stillValid =
      selectedInvoice &&
      unpaidInvoices.some(
        (inv) => inv.invoice_code === selectedInvoice.invoice_code
      );

    if (!stillValid) {
      setSelectedInvoice(firstUnpaid);
      return;
    }

    if (!selectedInvoice && firstUnpaid) {
      setSelectedInvoice(firstUnpaid);
    }
  }, [unpaidInvoices, selectedInvoice]);

  const getStageLabel = (item) => {
    if (!item) return "-";
    const hodDecision = (
      item.hod_recommendation ||
      item.hod_decision ||
      ""
    ).toLowerCase();
    if (item.review_stage === "hod") {
      return "HOD Review (must recommend before registrar)";
    }
    if (item.review_stage === "registrar") {
      const hodRecommended =
        !hodDecision ||
        hodDecision === "recommended" ||
        hodDecision === "approved";
      return hodRecommended
        ? "Registrar Review (HOD recommended)"
        : "Waiting for HOD recommendation";
    }
    return "Completed";
  };

  const hasPendingFinancial = useMemo(() => {
    return undertakingList.some((u) => {
      const kind = (u.kind || "financial").toLowerCase();
      const status = (u.status || "").toLowerCase();
      return (
        kind === "financial" &&
        ["pending", "pending_hod", "pending_registrar"].includes(status)
      );
    });
  }, [undertakingList]);

  const pendingFinancial = useMemo(() => {
    return undertakingList.find((u) => {
      const kind = (u.kind || "financial").toLowerCase();
      const status = (u.status || "").toLowerCase();
      return (
        kind === "financial" &&
        ["pending", "pending_hod", "pending_registrar"].includes(status)
      );
    });
  }, [undertakingList]);

  const hasPendingDocument = useMemo(() => {
    return undertakingList.some((u) => {
      const kind = (u.kind || "").toLowerCase();
      const status = (u.status || "").toLowerCase();
      return (
        kind === "document" &&
        ["pending", "pending_hod", "pending_registrar"].includes(status)
      );
    });
  }, [undertakingList]);

  const pendingDocument = useMemo(() => {
    return undertakingList.find((u) => {
      const kind = (u.kind || "").toLowerCase();
      const status = (u.status || "").toLowerCase();
      return (
        kind === "document" &&
        ["pending", "pending_hod", "pending_registrar"].includes(status)
      );
    });
  }, [undertakingList]);

  const hasPendingStationary = useMemo(() => {
    return undertakingList.some((u) => {
      const kind = (u.kind || "").toLowerCase();
      const status = (u.status || "").toLowerCase();
      return (
        kind === "stationary" &&
        ["pending", "pending_hod", "pending_registrar"].includes(status)
      );
    });
  }, [undertakingList]);

  const pendingStationary = useMemo(() => {
    return undertakingList.find((u) => {
      const kind = (u.kind || "").toLowerCase();
      const status = (u.status || "").toLowerCase();
      return (
        kind === "stationary" &&
        ["pending", "pending_hod", "pending_registrar"].includes(status)
      );
    });
  }, [undertakingList]);

  const financialSatisfied =
    unpaidInvoices.length === 0 || wallet >= outstandingTotal;

  const canApplyFinancial = !financialSatisfied && outstandingTotal > 0;

  const requiresFinancial =
    !financialSatisfied && !hasPendingFinancial && outstandingTotal > 0;

  const requiresDocument = hasMissingDocs && !hasPendingDocument;

  const missingStationaries = useMemo(
    () => clearanceSummary?.missing_stationaries || [],
    [clearanceSummary]
  );

  const requiresStationary =
    missingStationaries.length > 0 && !hasPendingStationary;

  const hasAnyPending =
    hasPendingFinancial || hasPendingDocument || hasPendingStationary;

  const approvedUndertakings = useMemo(() => {
    return undertakingList.filter((u) =>
      APPROVED_STATUSES.includes((u.status || "").toLowerCase())
    );
  }, [undertakingList]);
  const hasApprovedUndertaking = approvedUndertakings.length > 0;
  const hasReapplicationPending = useMemo(() => {
    return approvedUndertakings.some(
      (u) => (u.reapplication_status || "").toLowerCase() === "pending"
    );
  }, [approvedUndertakings]);
  const hasReapplicationApproval = useMemo(() => {
    return approvedUndertakings.some(
      (u) =>
        (u.reapplication_status || "").toLowerCase() === "approved" &&
        !u.reapplication_consumed_at
    );
  }, [approvedUndertakings]);
  const blocksNewSubmission =
    hasApprovedUndertaking && !hasReapplicationApproval;

  const toggleDoc = (name) => {
    setSelectedDocs((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleRequestReapplication = async () => {
    const result = await Swal.fire({
      title: "Request re-application",
      input: "textarea",
      inputLabel: "Reason for re-applying",
      inputPlaceholder: "Explain why you need to submit a new undertaking...",
      inputValue: "I request approval to re-apply for undertaking.",
      inputValidator: (value) =>
        !value || value.trim().length < 5 ? "Enter a brief reason" : undefined,
      showCancelButton: true,
      confirmButtonText: "Submit request",
    });

    if (!result.isConfirmed) return;

    try {
      setRequestingReapplication(true);
      await request
        .post(baseUrl + "invoices/request_undertaking_reapplication")
        .type("application/json")
        .send({
          target_id: userEmail,
          reason: result.value,
        });
      Toast.fire({
        icon: "success",
        title: "Re-application request submitted",
      });
      fetchUndertakingList();
    } catch (err) {
      Swal.fire(
        "Request failed",
        err?.response?.body?.error || "Unable to submit re-application request",
        "error"
      );
    } finally {
      setRequestingReapplication(false);
    }
  };

  const handleSubmitCombined = async () => {
    if (blocksNewSubmission) {
      Swal.fire(
        hasReapplicationPending ? "Awaiting registrar" : "Already approved",
        hasReapplicationPending
          ? "Your re-application request is pending registrar approval."
          : "You need registrar approval before submitting another undertaking.",
        "info"
      );
      return;
    }

    const needsFinancialNow = requiresFinancial && canApplyFinancial;
    const needsDocumentNow = requiresDocument;
    const needsStationaryNow = requiresStationary;

    if (!needsFinancialNow && !needsDocumentNow && !needsStationaryNow) {
      Swal.fire(
        "Not needed",
        "You either do not need an undertaking or you do not meet the requirements.",
        "info"
      );
      return;
    }

    if (needsFinancialNow && !selectedInvoice) {
      Toast.fire({ icon: "error", title: "Select an invoice" });
      return;
    }

    if (needsFinancialNow || needsDocumentNow || needsStationaryNow) {
      if (!expectedDate) {
        Toast.fire({
          icon: "error",
          title: "Expected clearance date is required",
        });
        return;
      }
    }

    Swal.fire({
      title: "Submitting",
      text: "Please wait...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    const prevIds = undertakingList.map((u) => u.id);

    try {
      setSubmitting(true);
      const tasks = [];
      if (needsFinancialNow) {
        tasks.push(
          request
            .post(baseUrl + "invoices/apply_undertaking/")
            .type("application/json")
            .send({
              invoice_code: selectedInvoice.invoice_code,
              pay_id: selectedInvoice.pay_id,
              target_id: userEmail,
              reason: DEFAULT_REASON,
              expected_clearance_date: expectedDate,
            })
        );
      }
      if (needsDocumentNow) {
        const docsToSend =
          selectedDocs.length > 0 ? selectedDocs : pendingDocNames;
        tasks.push(
          request
            .post(baseUrl + "invoices/apply_document_undertaking/")
            .type("application/json")
            .send({
              target_id: userEmail,
              reason: DEFAULT_REASON,
              expected_clearance_date: expectedDate,
              doc_names: docsToSend,
            })
        );
      }

      if (needsStationaryNow) {
        tasks.push(
          request
            .post(baseUrl + "invoices/apply_stationary_undertaking/")
            .type("application/json")
            .send({
              target_id: userEmail,
              reason: DEFAULT_REASON,
              expected_clearance_date: expectedDate,
              meta: { requested_stationaries: missingStationaries },
            })
        );
      }

      const results = await Promise.allSettled(tasks);
      const anyRejected = results.some((r) => r.status === "rejected");

      if (anyRejected) {
        try {
          const latest = await request
            .post(baseUrl + "invoices/student_undertaking_status")
            .type("application/json")
            .send({ target_id: userEmail });
          const latestData = latest.body?.data || [];
          const newOnes = latestData.filter((u) => !prevIds.includes(u.id));
          await Promise.allSettled(
            newOnes.map((u) =>
              request
                .post(baseUrl + "invoices/update_undertaking_status")
                .type("application/json")
                .send({ id: u.id, action: "reject" })
            )
          );
          setUndertakingList(latestData);
        } catch (_) {
          // Rollback best-effort; ignore errors.
        }

        Swal.close();
        const firstErr = results.find((r) => r.status === "rejected");
        const errMsg =
          firstErr?.reason?.response?.body?.error ||
          firstErr?.reason?.message ||
          "One or more requests failed. Please try again.";
        Swal.fire("Error", errMsg, "error");
        return;
      }

      Swal.close();
      Toast.fire({ icon: "success", title: "Undertaking submitted" });
      setExpectedDate("");
      setSelectedInvoice(null);
      setSelectedDocs([]);
      fetchUndertakingList();
      fetchClearanceSummary();
    } catch (err) {
      Swal.close();
      const existing = err?.response?.body?.existing;
      const msg = existing
        ? `You already have a ${existing.status} request (${
            existing.invoice_code || existing.expected_clearance_date || "-"
          })`
        : err?.response?.body?.error || "Failed to submit";
      Swal.fire("Error", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFinancial = () => {
    if (hasPendingFinancial) {
      const stage = getStageLabel(pendingFinancial);
      return (
        <div className="alert alert-info mb-0">
          Pending financial undertaking - Stage: {stage} - Status:{" "}
          {pendingFinancial?.status}
          {pendingFinancial?.expected_clearance_date
            ? ` - Expected: ${pendingFinancial.expected_clearance_date}`
            : ""}
        </div>
      );
    }

    if (unpaidInvoices.length === 0) {
      return (
        <div className="alert alert-success mb-0">
          No outstanding invoices. Financial undertaking not needed.
        </div>
      );
    }

    return (
      <div>
        <div className="mb-2">
          <div className="fw-bold">Outstanding Invoices</div>
          <div className="text-muted small">
            Outstanding total: {formatCurrency(outstandingTotal)} - Wallet:{" "}
            {formatCurrency(wallet)}
          </div>
        </div>
        <div className="table-responsive mb-3" style={{ maxHeight: "45vh" }}>
          <table className="table table-sm align-middle">
            <thead className="table-light">
              <tr>
                <th>Select</th>
                <th>Invoice</th>
                <th>Title</th>
                <th>Outstanding</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {unpaidInvoices.map((inv) => {
                const outstanding = Math.max(
                  0,
                  (parseFloat(inv.amount) || 0) - (parseFloat(inv.waiver) || 0)
                );
                return (
                  <tr key={inv.invoice_code}>
                    <td>
                      <input
                        type="radio"
                        name="invoice_select"
                        onChange={() => setSelectedInvoice(inv)}
                        checked={
                          selectedInvoice?.invoice_code === inv.invoice_code
                        }
                        disabled={!canApplyFinancial || hasPendingFinancial}
                      />
                    </td>
                    <td>{inv.invoice_code}</td>
                    <td>{inv.title}</td>
                    <td>{formatCurrency(outstanding)}</td>
                    <td>{inv.status}</td>
                  </tr>
                );
              })}
              {unpaidInvoices.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No unpaid invoices
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDocument = () => {
    return (
      <div>
        {hasPendingDocument && (
          <div className="alert alert-info">
            Pending document undertaking - Stage:{" "}
            {getStageLabel(pendingDocument)} - Status: {pendingDocument?.status}
            {pendingDocument?.expected_clearance_date
              ? ` - Expected: ${pendingDocument.expected_clearance_date}`
              : ""}
          </div>
        )}
        {!hasPendingDocument && hasMissingDocs && (
          <div className="alert alert-secondary">
            Missing documents will be included automatically in your request.
          </div>
        )}
        {!hasPendingDocument && (
          <div className="mb-3">
            <div className="fw-bold mb-2">Required Documents</div>
            <div className="table-responsive" style={{ maxHeight: "40vh" }}>
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Include</th>
                    <th>Document</th>
                    <th>Deferrable</th>
                    <th>Status</th>
                    <th>Submitted On</th>
                  </tr>
                </thead>
                <tbody>
                  {docStatus.map((doc, idx) => {
                    const name = doc.doc_name || doc.name;
                    const def = Number(doc.deferrable) === 1;
                    const submitted = !!doc.submitted;
                    const canToggle = !submitted;
                    const checked = selectedDocs.includes(name);
                    return (
                      <tr key={idx}>
                        <td>
                          {canToggle ? (
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleDoc(name)}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{name}</td>
                        <td>{def ? "Yes" : "No"}</td>
                        <td>{submitted ? "Submitted" : "Pending"}</td>
                        <td>{doc.submission_date || "-"}</td>
                      </tr>
                    );
                  })}
                  {docStatus.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No documents found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStationary = () => {
    const hasMissing = missingStationaries.length > 0;
    if (hasPendingStationary) {
      const stage = getStageLabel(pendingStationary);
      return (
        <div className="alert alert-info">
          Pending stationary undertaking - Stage: {stage} - Status:{" "}
          {pendingStationary?.status}
          {pendingStationary?.expected_clearance_date
            ? ` - Expected: ${pendingStationary.expected_clearance_date}`
            : ""}
        </div>
      );
    }

    if (!hasMissing) {
      return (
        <div className="alert alert-success mb-0">
          Stationaries fulfilled. No undertaking needed.
        </div>
      );
    }

    return (
      <div>
        <div className="alert alert-warning">
          Outstanding stationaries require an undertaking to proceed
          temporarily.
        </div>
        <ul className="small mb-0">
          {missingStationaries.map((s, idx) => (
            <li key={idx}>
              {s.name || "Stationary"} - required {s.required}, received{" "}
              {s.received}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderOutstanding = () => {
    return (
      <div className="row g-3">
        <div className="col-lg-4">{renderFinancial()}</div>
        <div className="col-lg-4">{renderDocument()}</div>
        <div className="col-lg-4">{renderStationary()}</div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="row g-3">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Undertaking (Invoices & Documents)</h5>
                {loading && (
                  <span className="text-muted small">Loading...</span>
                )}
              </div>
              {hasApprovedUndertaking && (
                <div
                  className={`alert ${
                    hasReapplicationApproval
                      ? "alert-success"
                      : hasReapplicationPending
                        ? "alert-info"
                        : "alert-warning"
                  } d-flex flex-wrap justify-content-between align-items-center gap-2`}
                >
                  <span>
                    {hasReapplicationApproval
                      ? "Registrar has approved your re-application. You can submit a new undertaking request."
                      : hasReapplicationPending
                        ? "Your re-application request is pending registrar approval."
                        : "You already have an approved undertaking. Request registrar approval to re-apply."}
                  </span>
                  {!hasReapplicationApproval && !hasReapplicationPending && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleRequestReapplication}
                      disabled={requestingReapplication}
                    >
                      {requestingReapplication
                        ? "Submitting..."
                        : "Request re-application"}
                    </button>
                  )}
                </div>
              )}
              {hasAnyPending && (
                <div className="alert alert-info">
                  You have a pending undertaking request. Wait for a decision
                  before submitting another.
                </div>
              )}
              {!hasAnyPending &&
                !requiresFinancial &&
                !requiresDocument &&
                !requiresStationary && (
                  <div className="alert alert-success">
                    You have no outstanding invoices, mandatory documents, or
                    stationaries. Undertaking is not required.
                  </div>
                )}
              {renderOutstanding()}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row g-2 mb-3">
                <div className="col-md-4 col-sm-6">
                  <label className="form-label">Expected clearance date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    disabled={hasAnyPending}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Your Undertaking Requests</h6>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={fetchUndertakingList}
                >
                  Refresh
                </button>
              </div>
              <div className="table-responsive" style={{ maxHeight: "45vh" }}>
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Invoice / Code</th>
                      <th>Stage</th>
                      <th>Status</th>
                      <th>Re-application</th>
                      <th>Expected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {undertakingList.map((u) => {
                      const stage = getStageLabel(u);
                      const reapplicationStatus =
                        u.reapplication_status || "-";
                      return (
                        <tr key={u.id}>
                          <td className="text-capitalize">
                            {u.kind || "financial"}
                          </td>
                          <td>{u.invoice_code}</td>
                          <td>{stage}</td>
                          <td className="text-capitalize">{u.status}</td>
                          <td className="text-capitalize">
                            {reapplicationStatus}
                          </td>
                          <td>{u.expected_clearance_date || "-"}</td>
                        </tr>
                      );
                    })}
                    {undertakingList.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No undertaking requests yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitCombined}
                  disabled={
                    submitting ||
                    blocksNewSubmission ||
                    (!requiresFinancial &&
                      !requiresDocument &&
                      !requiresStationary) ||
                    (requiresFinancial && !canApplyFinancial)
                  }
                >
                  {submitting ? "Submitting..." : "Submit Undertaking Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UndertakingPage;
