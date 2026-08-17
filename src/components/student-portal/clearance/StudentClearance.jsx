import React, { useEffect, useMemo, useRef, useState } from "react";
import request from "superagent";
import { Toast } from "../../errorNotifier";
import { baseUrl } from "../../../services/setup";
import logo from "../../../pictures/logo.png";

const yesify = (value) => (value ?? "").toString().trim().toLowerCase();

const isCanceledInvoice = (invoice) => {
  const status = yesify(invoice?.status);
  const storedStatus = yesify(invoice?.stored_status);
  const mode = yesify(invoice?.mode);
  return (
    status === "canceled" ||
    status === "cancelled" ||
    storedStatus === "canceled" ||
    storedStatus === "cancelled" ||
    mode === "canceled" ||
    mode === "cancelled"
  );
};

const getPriorityLevel = (invoice) => {
  const raw = invoice?.priority;
  const num = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
  return Number.isFinite(num) ? num : null;
};

const normalizeStatus = (key, value) => {
  const v = yesify(value);
  if (key === "RRClearanceStatus") {
    if (["yes", "cleared", "approved", "clear", "done"].includes(v)) {
      return "yes";
    }
    return v || "no";
  }
  return v || "no";
};

const StudentClearance = () => {
  const userEmail = localStorage.getItem("userEmail");
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [student, setStudent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [undertakings, setUndertakings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const printRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const fetchAll = async () => {
    if (!userEmail) {
      setError("Missing student email. Please login again.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const [clearanceRes, invoiceRes, undertakingRes, docRes] =
        await Promise.all([
          request
            .post(`${baseUrl}clearance/get`)
            .type("application/json")
            .send({ email: userEmail, role: "student" }),
          request
            .post(`${baseUrl}invoices/get_invoices_by_email/`)
            .type("application/json")
            .send({ email: userEmail }),
          request
            .post(`${baseUrl}invoices/student_undertaking_status`)
            .type("application/json")
            .send({ target_id: userEmail }),
          request
            .post(`${baseUrl}invoices/document_undertaking_status`)
            .type("application/json")
            .send({ target_id: userEmail }),
        ]);

      setRecord(clearanceRes.body?.data || null);
      setStudent(clearanceRes.body?.student || null);
      setSummary(clearanceRes.body?.summary || null);
      setInvoices(Array.isArray(invoiceRes.body) ? invoiceRes.body : []);
      setUndertakings(undertakingRes.body?.data || []);
      setDocuments(docRes.body?.data || []);
    } catch (err) {
      const apiErr =
        err?.response?.body?.error || err.message || "Failed to load clearance";
      setError(apiErr);
      Toast.fire({ icon: "error", title: apiErr });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const clearanceFields = useMemo(
    () => [
      { key: "BSOutstandingFees", label: "Bursar: Outstanding fees" },
      { key: "BSOtherLiabilities", label: "Bursar: Other liabilities" },
      { key: "AOA4", label: "Accounts: A4 issued" },
      { key: "AOFoolscaps", label: "Accounts: Foolscap issued" },
      { key: "HODVerifiedOriginalCopies", label: "HOD: Verified originals" },
      { key: "HODDepartmentalFile", label: "HOD: Departmental file" },
      { key: "HODSSCEDeficient", label: "HOD: SSCE deficient" },
      {
        key: "HODHasFilledDeficiencyForm",
        label: "HOD: Deficiency form completed",
      },
      {
        key: "SAOFulfiledRegistrationRequirements",
        label: "SAO: Registration requirements",
      },
      { key: "SAOConfirmedSubmissionToHOD", label: "SAO: Submitted to HOD" },
      { key: "RRClearanceStatus", label: "Registrar clearance" },
      { key: "RRClearanceExpiration", label: "Registrar clearance expiry" },
    ],
    []
  );

  // Derive A4/Foolscap clearance from registrar_stationaries_received (surfaced as missing_stationaries summary)
  const stationaryClearance = useMemo(() => {
    const allReceived = (summary?.missing_stationaries || []).length === 0;
    return {
      AOA4: allReceived ? "yes" : "no",
      AOFoolscaps: allReceived ? "yes" : "no",
    };
  }, [summary?.missing_stationaries]);

  const recordWithStationaries = useMemo(() => {
    if (!record) return record;
    return {
      ...record,
      AOA4: stationaryClearance.AOA4,
      AOFoolscaps: stationaryClearance.AOFoolscaps,
    };
  }, [record, stationaryClearance]);

  const undertakingBuckets = useMemo(() => {
    const financial = [];
    const documents = [];
    const stationaries = [];
    undertakings.forEach((u) => {
      const kind = yesify(u.kind || u.type || u.category || "");
      const code = (u.invoice_code || u.code || "").toUpperCase();
      const resolvedKind =
        kind === "document" || kind === "doc" || code.startsWith("DOC-")
          ? "document"
          : kind === "stationary" ||
            kind === "stationaries" ||
            kind === "stationery" ||
            code.startsWith("STAT-")
          ? "stationary"
          : "financial";
      if (resolvedKind === "document") documents.push(u);
      else if (resolvedKind === "stationary") stationaries.push(u);
      else financial.push(u);
    });
    return { financial, documents, stationaries };
  }, [undertakings]);

  const outstandingInvoices = useMemo(() => {
    return invoices
      .filter((inv) => !isCanceledInvoice(inv))
      .filter((inv) => yesify(inv.status) !== "paid")
      .filter((inv) => getPriorityLevel(inv) === 0);
  }, [invoices]);

  const approvedFinancialUndertakings = useMemo(() => {
    return undertakingBuckets.financial.filter(
      (u) => yesify(u.status) === "approved"
    );
  }, [undertakingBuckets.financial]);

  const hasApprovedFinancialUndertaking =
    approvedFinancialUndertakings.length > 0;

  const financialOk = useMemo(() => {
    if (outstandingInvoices.length === 0) return true;
    const allCovered = outstandingInvoices.every((inv) =>
      approvedFinancialUndertakings.some(
        (u) =>
          (u.invoice_code || "").toUpperCase() ===
          (inv.invoice_code || "").toUpperCase()
      )
    );
    return allCovered || hasApprovedFinancialUndertaking;
  }, [approvedFinancialUndertakings, outstandingInvoices, hasApprovedFinancialUndertaking]);

  const missingDocs = useMemo(
    () => documents.filter((d) => !d.submitted),
    [documents]
  );
  const approvedDocUndertaking = useMemo(() => {
    return undertakingBuckets.documents.some((u) => {
      const status = yesify(u.status);
      const code = (u.invoice_code || "").toUpperCase();
      return status === "approved" && code.startsWith("DOC-");
    });
  }, [undertakingBuckets.documents]);

  const docsSubmittedAll = documents.length > 0 && missingDocs.length === 0;

  const docsOk = useMemo(() => {
    // If the school has not recorded any documents yet, fall back to an approved undertaking
    if (documents.length === 0) return approvedDocUndertaking;
    if (missingDocs.length === 0) return true;
    // Missing docs can be covered by an approved document undertaking
    return approvedDocUndertaking;
  }, [documents.length, missingDocs, approvedDocUndertaking]);

  const hodDeficient = yesify(record?.HODSSCEDeficient) === "yes";
  const hodDefForm = yesify(record?.HODHasFilledDeficiencyForm) === "yes";

  const registrarOk =
    normalizeStatus(
      "RRClearanceStatus",
      recordWithStationaries?.RRClearanceStatus
    ) === "yes";
  const baseOk = [
    "BSOutstandingFees",
    "BSOtherLiabilities",
    "AOA4",
    "AOFoolscaps",
    "HODVerifiedOriginalCopies",
    "HODDepartmentalFile",
    "SAOFulfiledRegistrationRequirements",
    "SAOConfirmedSubmissionToHOD",
  ].every(
    (key) => normalizeStatus(key, recordWithStationaries?.[key]) === "yes"
  );

  const hodOk = !hodDeficient || hodDefForm;
  const clearanceOk = baseOk && registrarOk && hodOk;

  const missingStationaries = summary?.missing_stationaries || [];
  const approvedStationaryUndertaking = useMemo(
    () =>
      undertakingBuckets.stationaries.some(
        (u) => yesify(u.status || "") === "approved"
      ),
    [undertakingBuckets.stationaries]
  );

  const hasStationaryUndertaking = useMemo(
    () =>
      !!summary?.has_stationary_undertaking || approvedStationaryUndertaking,
    [summary?.has_stationary_undertaking, approvedStationaryUndertaking]
  );
  const stationariesOk =
    !summary || missingStationaries.length === 0 || hasStationaryUndertaking;

  const readyForDownload = financialOk && docsOk && stationariesOk;

  const clearanceMode = useMemo(() => {
    if (
      outstandingInvoices.length === 0 &&
      docsSubmittedAll &&
      missingStationaries.length === 0
    )
      return "full";
    if (
      hasApprovedFinancialUndertaking ||
      approvedDocUndertaking ||
      hasStationaryUndertaking
    )
      return "temporary";
    return "blocked";
  }, [
    outstandingInvoices.length,
    docsSubmittedAll,
    hasApprovedFinancialUndertaking,
    approvedDocUndertaking,
    hasStationaryUndertaking,
    missingStationaries.length,
  ]);

  const registrarExpiration = useMemo(() => {
    if (clearanceMode !== "temporary") return "";
    const approvedWithNote = undertakings.filter((u) => {
      return (
        yesify(u.status) === "approved" && (u.registrar_comment || u.comment)
      );
    });
    const dates = approvedWithNote
      .map((u) => u.registrar_comment || u.comment || "")
      .map((text) => {
        const match = (text || "").match(
          /Expiration:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i
        );
        return match ? match[1] : "";
      })
      .filter(Boolean);
    if (!dates.length) return "";
    return dates.sort().pop();
  }, [undertakings, clearanceMode]);

  const clearanceStatuses = useMemo(() => {
    return clearanceFields.map((f) => ({
      ...f,
      value:
        f.key === "RRClearanceStatus"
          ? clearanceMode === "full"
            ? "Full clearance"
            : clearanceMode === "temporary"
            ? "Temporary clearance"
            : normalizeStatus(f.key, recordWithStationaries?.[f.key])
          : f.key === "RRClearanceExpiration"
          ? registrarExpiration || recordWithStationaries?.[f.key] || ""
          : normalizeStatus(f.key, recordWithStationaries?.[f.key]),
    }));
  }, [
    clearanceFields,
    recordWithStationaries,
    clearanceMode,
    registrarExpiration,
  ]);

  const barcodeValue = useMemo(() => {
    const email = student?.Email || userEmail || "";
    const matric = student?.MatricNumber || student?.MatNumber || "";
    return `${email}|${matric}|${clearanceMode}`;
  }, [student, userEmail, clearanceMode]);

  const barcodeUrl = useMemo(() => {
    if (!barcodeValue) return null;
    const encoded = encodeURIComponent(barcodeValue);
    return `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encoded}&includetext=false&scale=2&height=12`;
  }, [barcodeValue]);

  const qrUrl = useMemo(() => {
    if (!barcodeValue) return null;
    const encoded = encodeURIComponent(barcodeValue);
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encoded}`;
  }, [barcodeValue]);

  useEffect(() => {
    let cancelled = false;
    const loadQr = async () => {
      if (!qrUrl) {
        setQrDataUrl(null);
        return;
      }
      try {
        const res = await fetch(qrUrl, { cache: "no-cache" });
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled) setQrDataUrl(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        if (!cancelled) setQrDataUrl(null);
      }
    };
    loadQr();
    return () => {
      cancelled = true;
    };
  }, [qrUrl]);

  const blockingReasons = useMemo(() => {
    const issues = [];
    if (outstandingInvoices.length > 0 && !hasApprovedFinancialUndertaking) {
      issues.push(
        "Clear all unpaid invoices or obtain an approved financial undertaking."
      );
    }
    if (!docsSubmittedAll && !approvedDocUndertaking) {
      issues.push(
        "Submit all registration documents or obtain an approved document undertaking."
      );
    }
    if (missingStationaries.length > 0 && !hasStationaryUndertaking) {
      issues.push(
        "Provide all required stationaries or an approved undertaking."
      );
    }
    if (!issues.length) {
      issues.push("Awaiting approval of your undertaking request.");
    }
    return issues;
  }, [
    outstandingInvoices.length,
    hasApprovedFinancialUndertaking,
    docsSubmittedAll,
    approvedDocUndertaking,
    missingStationaries,
    hasStationaryUndertaking,
  ]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const handlePrint = () => {
    if (!readyForDownload) {
      Toast.fire({
        icon: "warning",
        title: "You must satisfy all clearance rules first",
      });
      return;
    }
    const content = printRef.current?.innerHTML;
    if (!content) {
      Toast.fire({ icon: "error", title: "Nothing to print" });
      return;
    }
    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) {
      Toast.fire({ icon: "error", title: "Unable to open print window" });
      return;
    }
    printWindow.document.write(`<!doctype html>
<html>
<head>
  <title>Clearance Form</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 16px; }
    .logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .logo-row img { width: 48px; height: 48px; }
    h3 { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; text-align: left; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; color: #fff; font-size: 11px; }
    .badge-yes { background: #198754; }
    .badge-no { background: #dc3545; }
  </style>
</head>
<body>${content}</body>
</html>`);
    printWindow.document.close();
    const waitForImages = () => {
      return new Promise((resolve) => {
        const imgs = Array.from(printWindow.document.images || []);
        if (!imgs.length) return resolve();
        let loaded = 0;
        const done = () => {
          loaded += 1;
          if (loaded >= imgs.length) resolve();
        };
        imgs.forEach((img) => {
          if (img.complete) {
            done();
            return;
          }
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        });
        setTimeout(resolve, 800); // fallback so we don't block forever
      });
    };

    const triggerPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (err) {
        // If the browser blocks print, the user can still manually print/save the opened tab.
      }
    };

    const startPrint = async () => {
      await waitForImages();
      triggerPrint();
    };

    if (printWindow.document.readyState === "complete") {
      setTimeout(startPrint, 150);
    } else {
      printWindow.onload = () => setTimeout(startPrint, 150);
    }
  };

  const renderBadge = (val) => {
    const v = yesify(val);
    const isYes = v === "yes";
    const label = v ? v : "-";
    return (
      <span className={`badge ${isYes ? "badge-yes" : "badge-no"}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">Student Clearance</h5>
          <small className="text-muted">
            Track your clearance and download your form.
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            {refreshing || loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={handlePrint}
            disabled={!readyForDownload}
          >
            Download clearance PDF
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && (
        <div className="alert alert-info">Loading clearance data...</div>
      )}

      {student && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="mb-2">Student profile</h6>
            <div className="row small">
              <div className="col-md-4">Name: {student.Fullname}</div>
              <div className="col-md-4">
                Matric: {student.MatricNumber || student.MatNumber || "-"}
              </div>
              <div className="col-md-4">Email: {student.Email}</div>
              <div className="col-md-4">Department: {student.Department}</div>
              <div className="col-md-4">Programme: {student.Programme}</div>
              <div className="col-md-4">Session: {student.SessionOfEntry}</div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="mb-3">Financial</h6>
              {outstandingInvoices.length === 0 && (
                <div className="text-success small">No unpaid invoices.</div>
              )}
              {outstandingInvoices.length > 0 && (
                <ul className="small mb-3">
                  {outstandingInvoices.map((inv) => (
                    <li key={inv.invoice_code || inv.pay_id}>
                      {inv.title || inv.invoice_code || "Invoice"} -{" "}
                      {inv.status || "Unpaid"}
                    </li>
                  ))}
                </ul>
              )}

              <div className="small">
                <div className="fw-semibold mb-1">Undertakings</div>
                {undertakingBuckets.financial.length === 0 && (
                  <div className="text-muted">No financial undertaking.</div>
                )}
                {undertakingBuckets.financial.map((u) => (
                  <div key={u.id || u.invoice_code}>
                    {u.invoice_code || "Undertaking"}: {u.status || "-"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="mb-3">Documents</h6>
              {missingDocs.length === 0 && (
                <div className="text-success small">
                  All documents submitted.
                </div>
              )}
              {missingDocs.length > 0 && (
                <ul className="small mb-3">
                  {missingDocs.map((doc) => (
                    <li key={doc.doc_name}>{doc.doc_name}</li>
                  ))}
                </ul>
              )}

              <div className="small">
                <div className="fw-semibold mb-1">Document undertaking</div>
                {undertakingBuckets.documents.length === 0 && (
                  <div className="text-muted">No document undertaking.</div>
                )}
                {undertakingBuckets.documents.map((u) => (
                  <div key={u.id || u.invoice_code}>
                    {u.invoice_code || "DOC"}: {u.status || "-"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="mb-3">Stationaries</h6>
              {missingStationaries.length === 0 && (
                <div className="text-success small">
                  All required stationaries are recorded as received.
                </div>
              )}
              {missingStationaries.length > 0 && (
                <ul className="small mb-2">
                  {missingStationaries.map((s, idx) => (
                    <li key={idx}>
                      {s.name || "Stationary"} — required {s.required}, received{" "}
                      {s.received}
                    </li>
                  ))}
                </ul>
              )}
              {hasStationaryUndertaking && (
                <div className="alert alert-info py-2 px-3 small mb-0">
                  Stationary undertaking approved. You have temporary clearance
                  for stationaries.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!readyForDownload && blockingReasons.length > 0 && (
        <div className="alert alert-warning small my-3">
          <div className="fw-bold mb-1">Why download is locked</div>
          <ul className="mb-0">
            {blockingReasons.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
      {readyForDownload && (
        <div className="alert alert-success small my-3">
          {clearanceMode === "full"
            ? "All clear. You can download your clearance form."
            : "Temporary clearance via approved undertaking(s). You can download your clearance form."}
        </div>
      )}

      <div className="d-none" ref={printRef}>
        <div className="logo-row">
          <img src={logo} alt="College logo" />
          <div>
            <div className="fw-bold">MCHST Funtua</div>
            <div className="small text-muted">Student Clearance Form</div>
          </div>
        </div>
        <h3>Clearance Form</h3>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ marginBottom: 0 }}>
              <strong>Name:</strong> {student?.Fullname || "-"} <br />
              <strong>Matric:</strong>{" "}
              {student?.MatricNumber || student?.MatNumber || "-"} <br />
              <strong>Department:</strong> {student?.Department || "-"} <br />
              <strong>Programme:</strong> {student?.Programme || "-"} <br />
              <strong>Session:</strong> {student?.SessionOfEntry || "-"}
              <br />
              <strong>Clearance type:</strong>{" "}
              {clearanceMode === "full" ? "Full" : "Temporary"}
            </p>
          </div>
          {(qrDataUrl || qrUrl) && (
            <div style={{ width: 180, textAlign: "center" }}>
              <img
                src={qrDataUrl || qrUrl}
                alt="Clearance QR"
                style={{ width: "100%", height: "auto" }}
              />
              <div className="small text-muted" style={{ marginTop: 4 }}>
                QR authenticity: {barcodeValue}
              </div>
            </div>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clearanceStatuses.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>
                  {row.key === "RRClearanceExpiration" ? (
                    row.value ? (
                      <strong>{row.value}</strong>
                    ) : (
                      "-"
                    )
                  ) : row.key === "RRClearanceStatus" ? (
                    row.value || "Pending"
                  ) : yesify(row.value) === "yes" ? (
                    "Cleared"
                  ) : (
                    "Pending"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: "12px" }}>
          <strong>Financial status:</strong>{" "}
          {financialOk ? "Cleared" : "Pending"} <br />
          <strong>Documents:</strong>{" "}
          {docsOk ? "All submitted" : "Pending submissions"}
        </p>
      </div>
    </div>
  );
};

export default StudentClearance;
