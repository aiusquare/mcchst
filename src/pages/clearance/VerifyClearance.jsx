import React, { useEffect, useMemo, useRef, useState } from "react";
import request from "superagent";
import { Toast } from "../../components/errorNotifier";
import { baseUrl } from "../../services/setup";

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

const VerifyClearance = () => {
  const [queryEmail, setQueryEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const [student, setStudent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [undertakings, setUndertakings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState(null);
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const zxingReaderRef = useRef(null);
  const zxingControlsRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScan();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScan = () => {
    setScanning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (zxingControlsRef.current) {
      try {
        zxingControlsRef.current.stop();
      } catch (_) {
        // ignore
      }
      zxingControlsRef.current = null;
    }
    if (zxingReaderRef.current) {
      try {
        zxingReaderRef.current.reset();
      } catch (_) {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startScan = async () => {
    stopScan();
    try {
      if (window.BarcodeDetector) {
        const detector = new window.BarcodeDetector({
          formats: ["qr_code", "code_128"],
        });
        detectorRef.current = detector;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setScanning(true);
        const scanFrame = async () => {
          if (!detectorRef.current || !videoRef.current) return;
          try {
            const codes = await detectorRef.current.detect(videoRef.current);
            if (codes && codes.length) {
              const raw = codes[0].rawValue || "";
              handleScanResult(raw);
              stopScan();
              return;
            }
          } catch (err) {
            // ignore per-frame errors
          }
          rafRef.current = requestAnimationFrame(scanFrame);
        };
        rafRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = zxingReaderRef.current || new BrowserMultiFormatReader();
      zxingReaderRef.current = reader;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      zxingControlsRef.current = await reader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result) {
            handleScanResult(result.getText());
            stopScan();
          } else if (err && err.name && err.name !== "NotFoundException") {
            // ignore transient camera read errors
          }
        }
      );
    } catch (err) {
      Toast.fire({ icon: "error", title: err?.message || "Camera error" });
      stopScan();
    }
  };

  const handleScanResult = (raw) => {
    if (!raw) return;
    const parts = raw.split("|");
    if (parts.length >= 1) {
      const email = parts[0]?.trim();
      if (email) {
        setQueryEmail(email);
        fetchAllWith(email);
        return;
      }
    }
    Toast.fire({ icon: "info", title: "Scanned, but could not read email" });
  };

  const fetchAllWith = async (emailInput) => {
    const email = (emailInput || queryEmail).trim().toLowerCase();
    if (!email) {
      Toast.fire({ icon: "info", title: "Enter a student email" });
      return;
    }
    try {
      setLoading(true);
      setRecord(null);
      setStudent(null);
      setInvoices([]);
      setUndertakings([]);
      setDocuments([]);
      setSummary(null);

      const [clearanceRes, invoiceRes, undertakingRes, docRes] =
        await Promise.all([
          request
            .post(`${baseUrl}clearance/get`)
            .type("application/json")
            .send({ email, role: "student" }),
          request
            .post(`${baseUrl}invoices/get_invoices_by_email/`)
            .type("application/json")
            .send({ email }),
          request
            .post(`${baseUrl}invoices/student_undertaking_status`)
            .type("application/json")
            .send({ target_id: email }),
          request
            .post(`${baseUrl}invoices/document_undertaking_status`)
            .type("application/json")
            .send({ target_id: email }),
        ]);

      setRecord(clearanceRes.body?.data || null);
      setStudent(clearanceRes.body?.student || null);
      setSummary(clearanceRes.body?.summary || null);
      setInvoices(Array.isArray(invoiceRes.body) ? invoiceRes.body : []);
      setUndertakings(undertakingRes.body?.data || []);
      setDocuments(docRes.body?.data || []);
    } catch (err) {
      const apiErr =
        err?.response?.body?.error || err.message || "Failed to verify";
      Toast.fire({ icon: "error", title: apiErr });
    } finally {
      setLoading(false);
    }
  };

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

  const clearanceStatuses = useMemo(() => {
    return clearanceFields.map((f) => ({
      ...f,
      value:
        f.key === "RRClearanceExpiration"
          ? record?.[f.key] || ""
          : normalizeStatus(f.key, record?.[f.key]),
    }));
  }, [clearanceFields, record]);

  const outstandingInvoices = useMemo(() => {
    return invoices
      .filter((inv) => !isCanceledInvoice(inv))
      .filter((inv) => yesify(inv.status) !== "paid")
      .filter((inv) => getPriorityLevel(inv) === 0);
  }, [invoices]);

  const approvedFinancialUndertakings = useMemo(() => {
    return undertakings.filter((u) => {
      const kind = yesify(u.kind || "financial");
      const status = yesify(u.status);
      return kind !== "document" && status === "approved";
    });
  }, [undertakings]);

  const hasApprovedFinancialUndertaking =
    approvedFinancialUndertakings.length > 0;

  const financialOk = useMemo(() => {
    if (outstandingInvoices.length === 0) return true;
    return outstandingInvoices.every((inv) =>
      approvedFinancialUndertakings.some(
        (u) =>
          (u.invoice_code || "").toUpperCase() ===
          (inv.invoice_code || "").toUpperCase()
      )
    );
  }, [approvedFinancialUndertakings, outstandingInvoices]);

  const missingDocs = useMemo(
    () => documents.filter((d) => !d.submitted),
    [documents]
  );
  const approvedDocUndertaking = useMemo(() => {
    return undertakings.some((u) => {
      const kind = yesify(u.kind || "document");
      const status = yesify(u.status);
      const code = (u.invoice_code || "").toUpperCase();
      return (
        kind === "document" && status === "approved" && code.startsWith("DOC-")
      );
    });
  }, [undertakings]);

  const docsSubmittedAll = documents.length > 0 && missingDocs.length === 0;

  const docsOk = useMemo(() => {
    if (documents.length === 0) return false;
    if (missingDocs.length === 0) return true;
    return approvedDocUndertaking;
  }, [documents.length, missingDocs.length, approvedDocUndertaking]);

  const missingStationaries = summary?.missing_stationaries || [];
  const approvedStationaryUndertaking = useMemo(
    () =>
      undertakings.some((u) => {
        const kind = yesify(u.kind || "");
        const status = yesify(u.status || "");
        return kind === "stationary" && status === "approved";
      }),
    [undertakings]
  );

  const hasStationaryUndertaking =
    !!summary?.has_stationary_undertaking || approvedStationaryUndertaking;
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

  return (
    <div className="container py-4">
      <div className="mb-3">
        <h5 className="mb-1">Clearance Authenticity Check</h5>
        <div className="card mb-3">
          <div className="card-body d-flex flex-column gap-3">
            <div className="d-flex flex-column flex-sm-row gap-2">
              <input
                type="email"
                className="form-control"
                placeholder="student@example.com"
                value={queryEmail}
                onChange={(e) => setQueryEmail(e.target.value)}
              />
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => fetchAllWith()}
                  disabled={loading}
                >
                  {loading ? "Checking..." : "Verify"}
                </button>
                <button
                  className={`btn ${
                    scanning ? "btn-danger" : "btn-outline-secondary"
                  }`}
                  type="button"
                  onClick={scanning ? stopScan : startScan}
                >
                  {scanning ? "Stop scan" : "Scan QR/Barcode"}
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                border: "1px dashed #d0d5dd",
                borderRadius: 10,
                padding: 12,
                minHeight: 120,
              }}
            >
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  maxWidth: 420,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "#f8fafc",
                }}
                muted
                playsInline
              />
              <div
                className="small text-muted text-center"
                style={{ minHeight: 18 }}
              >
                {scanning
                  ? "Point your camera at the clearance QR/barcode."
                  : "Click Scan to start camera and read the QR/barcode."}
              </div>
            </div>
          </div>
        </div>

        {student && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Student</h6>
                <span className="badge bg-secondary text-uppercase">
                  {clearanceMode === "full"
                    ? "Full clearance"
                    : clearanceMode === "temporary"
                    ? "Temporary clearance"
                    : "Not cleared"}
                </span>
              </div>
              <div className="row small">
                <div className="col-md-4">Name: {student.Fullname}</div>
                <div className="col-md-4">
                  Matric: {student.MatricNumber || student.MatNumber || "-"}
                </div>
                <div className="col-md-4">Email: {student.Email}</div>
                <div className="col-md-4">Department: {student.Department}</div>
                <div className="col-md-4">Programme: {student.Programme}</div>
                <div className="col-md-4">
                  Session: {student.SessionOfEntry}
                </div>
              </div>
            </div>
          </div>
        )}

        {record && (
          <div className="card">
            <div className="card-body">
              <h6 className="mb-3">Clearance checks</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
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
                          {row.key === "RRClearanceExpiration"
                            ? row.value || "-"
                            : yesify(row.value) === "yes"
                            ? "Cleared"
                            : "Pending"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!record && !loading && (
          <div className="text-muted small">No result yet.</div>
        )}
      </div>
    </div>
  );
};

export default VerifyClearance;
