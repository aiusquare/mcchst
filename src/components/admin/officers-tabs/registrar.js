import React, { useCallback, useEffect, useMemo, useState } from "react";
import request from "superagent";
import Swal from "sweetalert2";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../errorNotifier";

const currency = (amount) =>
  `NGN ${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const safeArray = (value) => (Array.isArray(value) ? value : []);

const formatList = (items) => {
  const normalized = safeArray(items)
    .map((item) => {
      if (typeof item === "string") return item;
      const name = item?.name || item?.doc_name || item?.description || "Item";
      const qty = item?.outstanding || item?.quantity_required || item?.quantity || "";
      return qty ? `${name} (x${qty})` : name;
    })
    .filter(Boolean);

  return normalized.length ? normalized.join(", ") : "-";
};

const getKind = (item) => {
  const code = String(item.invoice_code || "").toUpperCase();
  if (item.kind) return String(item.kind).toLowerCase();
  if (code.startsWith("DOC-")) return "document";
  if (code.startsWith("STAT-")) return "stationary";
  return "financial";
};

const canReviewItem = (item, isHodStage) => {
  const status = normalizeStatus(item.status);
  const reviewStage = normalizeStatus(item.review_stage || item.stage);

  return isHodStage
    ? status === "pending_hod" || reviewStage === "hod"
    : status === "pending_registrar" || status === "pending" || reviewStage === "registrar";
};

const getStudentKey = (item) => item.target_id || item.invoice_target || item.id;

const getStudentName = (item) =>
  item.student_name ||
  item.pre_fullname ||
  item.app_fullname ||
  item.target_id ||
  "Unknown student";

const getApplicationNo = (item) =>
  item.application_number ||
  item.pre_application_id ||
  item.app_application_id ||
  "-";

export default function RegistrarTab({
  stage = "registrar",
  readOnly = false,
  title: titleProp,
  queueLabel: queueLabelProp,
}) {
  const [items, setItems] = useState([]);
  const [reapplications, setReapplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState({});
  const [selectedReapplications, setSelectedReapplications] = useState({});
  const [activeQueue, setActiveQueue] = useState("recommendation");

  const normalizedStage = readOnly
    ? String(stage || "").toLowerCase()
    : String(stage || "registrar").toLowerCase();
  const department =
    localStorage.getItem("department") || localStorage.getItem("dept") || "";
  const isHodStage = normalizedStage === "hod";
  const title = titleProp || "Undertaking Requests";
  const queueLabel =
    queueLabelProp || (isHodStage ? "HOD Queue" : "Registrar Queue");
  const approveText = isHodStage ? "Recommend" : "Approve";
  const approveSelectedText = isHodStage ? "Recommend Selected" : "Approve Selected";
  const approveRowText = isHodStage ? "Recommend Row" : "Approve Row";
  const rejectText = isHodStage ? "Do Not Recommend" : "Reject";
  const rejectSelectedText = isHodStage ? "Reject Selected" : "Reject Selected";
  const rejectRowText = isHodStage ? "Do Not Recommend Row" : "Reject Row";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = normalizedStage ? { stage: normalizedStage } : {};
      if (isHodStage && department) {
        query.department = department;
      }

      const undertakingRes = await request
        .get(`${baseUrl}/invoices/list_undertakings`)
        .query(query);

      setItems(undertakingRes.body?.data || []);

      if (isHodStage) {
        const reapplicationRes = await request
          .get(`${baseUrl}/invoices/list_undertaking_reapplications`)
          .query({ ...query, status: "pending" });
        setReapplications(reapplicationRes.body?.data || []);
      } else {
        setReapplications([]);
        setSelectedReapplications({});
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Failed to load undertakings",
      });
    } finally {
      setLoading(false);
    }
  }, [department, isHodStage, normalizedStage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isHodStage && activeQueue !== "recommendation") {
      setActiveQueue("recommendation");
    }
  }, [activeQueue, isHodStage]);

  const groupedRows = useMemo(() => {
    const map = new Map();

    items.forEach((item) => {
      const key = getStudentKey(item);
      if (!map.has(key)) {
        map.set(key, {
          key,
          target_id: item.target_id,
          name: getStudentName(item),
          matric: item.matric_number || "-",
          application: getApplicationNo(item),
          department: item.student_department || item.invoice_department || "",
          items: [],
          financial: null,
          document: null,
          stationary: null,
        });
      }

      const row = map.get(key);
      row.items.push(item);
      const kind = getKind(item);
      if (kind === "document") row.document = item;
      else if (kind === "stationary") row.stationary = item;
      else row.financial = item;
    });

    return Array.from(map.values()).map((row) => ({
      ...row,
      actionableItems: readOnly
        ? []
        : row.items.filter((item) => canReviewItem(item, isHodStage)),
    }));
  }, [isHodStage, items, readOnly]);

  const selectedKeys = useMemo(
    () => groupedRows.filter((row) => selected[row.key]).map((row) => row.key),
    [groupedRows, selected]
  );

  const selectedActionableIds = useMemo(
    () =>
      groupedRows
        .filter((row) => selected[row.key])
        .flatMap((row) => row.actionableItems.map((item) => item.id)),
    [groupedRows, selected]
  );

  const selectedReapplicationIds = useMemo(
    () =>
      reapplications
        .filter((item) => selectedReapplications[item.id])
        .map((item) => item.id),
    [reapplications, selectedReapplications]
  );

  const allSelected =
    groupedRows.length > 0 && groupedRows.every((row) => selected[row.key]);
  const allReapplicationsSelected =
    reapplications.length > 0 &&
    reapplications.every((item) => selectedReapplications[item.id]);

  const toggleAll = (checked) => {
    if (!checked) {
      setSelected({});
      return;
    }

    setSelected(
      groupedRows.reduce((acc, row) => {
        acc[row.key] = true;
        return acc;
      }, {})
    );
  };

  const toggleRow = (key) => {
    setSelected((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAllReapplications = (checked) => {
    if (!checked) {
      setSelectedReapplications({});
      return;
    }

    setSelectedReapplications(
      reapplications.reduce((acc, item) => {
        acc[item.id] = true;
        return acc;
      }, {})
    );
  };

  const changeQueue = (queue) => {
    setActiveQueue(queue);
    setSelected({});
    setSelectedReapplications({});
  };

  const postAction = async (id, action) =>
    request
      .post(`${baseUrl}/invoices/update_undertaking_status`)
      .type("application/json")
      .send({
        id,
        action,
        actor: normalizedStage,
        department: isHodStage ? department : undefined,
      });

  const postReapplicationAction = async (ids, action) =>
    request
      .post(`${baseUrl}/invoices/update_undertaking_reapplication_status`)
      .type("application/json")
      .send({
        ids,
        action,
        actor: normalizedStage,
        department: isHodStage ? department : undefined,
      });

  const updateStatus = async (ids, action) => {
    const cleanIds = Array.isArray(ids) ? ids.filter(Boolean) : [ids].filter(Boolean);
    if (!cleanIds.length) {
      Toast.fire({ icon: "error", title: "No actionable undertaking selected" });
      return;
    }

    const actionLabel = action === "approve" ? approveText : rejectText;
    const result = await Swal.fire({
      title: `${actionLabel} undertaking?`,
      text:
        cleanIds.length === 1
          ? "This will process the selected undertaking."
          : `This will process ${cleanIds.length} undertakings.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: actionLabel,
      confirmButtonColor: action === "approve" ? "#198754" : "#dc3545",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Processing",
      text: "Please wait...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const responses = await Promise.allSettled(
        cleanIds.map((id) => postAction(id, action))
      );
      const failed = responses.filter((response) => response.status === "rejected");

      Swal.close();
      if (failed.length) {
        Swal.fire(
          "Some actions failed",
          `${failed.length} of ${cleanIds.length} request(s) could not be processed.`,
          "warning"
        );
      } else {
        Toast.fire({ icon: "success", title: `Request ${action}d` });
      }

      setSelected({});
      fetchData();
    } catch (err) {
      Swal.close();
      Swal.fire(
        "Error",
        err?.response?.body?.error || "Unable to update",
        "error"
      );
    }
  };

  const updateReapplicationStatus = async (ids, action) => {
    const cleanIds = Array.isArray(ids) ? ids.filter(Boolean) : [ids].filter(Boolean);
    if (!cleanIds.length) {
      Toast.fire({ icon: "error", title: "No re-application selected" });
      return;
    }

    const verb = action === "approve" ? "Approve" : "Reject";
    const result = await Swal.fire({
      title: `${verb} re-application?`,
      text:
        cleanIds.length === 1
          ? "This will process the selected re-application request."
          : `This will process ${cleanIds.length} re-application requests.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: verb,
      confirmButtonColor: action === "approve" ? "#198754" : "#dc3545",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Processing",
      text: "Please wait...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await postReapplicationAction(cleanIds, action);
      Swal.close();
      Toast.fire({
        icon: "success",
        title: `Re-application ${action === "approve" ? "approved" : "rejected"}`,
      });
      setSelectedReapplications({});
      fetchData();
    } catch (err) {
      Swal.close();
      Swal.fire(
        "Error",
        err?.response?.body?.error || "Unable to update re-application",
        "error"
      );
    }
  };

  const renderFinancial = (item) => {
    if (!item) return <span className="text-muted">No financial undertaking</span>;

    return (
      <div>
        <div>{item.invoice_code}</div>
        <div>Amt: {currency(item.amount || item.outstanding_snapshot)}</div>
        <div>Out: {currency(item.outstanding_snapshot)}</div>
        <div>Wallet: {currency(item.wallet_snapshot)}</div>
        <div>Req: {item.reason || "-"}</div>
        <div>Expected: {item.expected_clearance_date || "-"}</div>
      </div>
    );
  };

  const renderDocument = (item) => {
    if (!item) return <span className="text-muted">No document undertaking</span>;

    const meta = item.meta_parsed || {};
    return (
      <div>
        <div>{item.invoice_code}</div>
        <div>Missing: {formatList(meta.missing_docs)}</div>
        <div>Requested: {formatList(meta.requested_docs)}</div>
        <div>Expected: {item.expected_clearance_date || "-"}</div>
      </div>
    );
  };

  const renderStationary = (item) => {
    if (!item) return <span className="text-muted">No stationary undertaking</span>;

    const meta = item.meta_parsed || {};
    return (
      <div>
        <div>{item.invoice_code}</div>
        <div>Missing: {formatList(meta.missing_stationaries)}</div>
        <div>Requested: {formatList(meta.requested_stationaries)}</div>
        <div>Expected: {item.expected_clearance_date || "-"}</div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-3">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h5 className="mb-0">{title}</h5>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-primary align-self-center">{queueLabel}</span>
              {isHodStage && (
                <div className="btn-group btn-group-sm" role="group" aria-label="Undertaking queue">
                  <button
                    type="button"
                    className={`btn ${
                      activeQueue === "recommendation"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => changeQueue("recommendation")}
                    disabled={loading}
                  >
                    Recommendation
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      activeQueue === "reapplication"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => changeQueue("reapplication")}
                    disabled={loading}
                  >
                    Re-application Requests
                  </button>
                </div>
              )}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={fetchData}
                disabled={loading}
              >
                Refresh
              </button>
              {activeQueue === "recommendation" && (
                <>
                  {!readOnly && (
                    <>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => updateStatus(selectedActionableIds, "approve")}
                        disabled={!selectedActionableIds.length || loading}
                      >
                        {approveSelectedText}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => updateStatus(selectedActionableIds, "reject")}
                        disabled={!selectedActionableIds.length || loading}
                      >
                        {rejectSelectedText}
                      </button>
                    </>
                  )}
                </>
              )}
              {isHodStage && activeQueue === "reapplication" && (
                <>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => updateReapplicationStatus(selectedReapplicationIds, "approve")}
                    disabled={!selectedReapplicationIds.length || loading}
                  >
                    Approve Re-application Selected
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => updateReapplicationStatus(selectedReapplicationIds, "reject")}
                    disabled={!selectedReapplicationIds.length || loading}
                  >
                    Reject Re-application Selected
                  </button>
                </>
              )}
            </div>
          </div>

          {activeQueue === "recommendation" && selectedKeys.length > 0 && (
            <div className="alert alert-info py-2">
              {selectedKeys.length} student row(s) selected,{" "}
              {selectedActionableIds.length} actionable undertaking(s).
            </div>
          )}

          {isHodStage && activeQueue === "reapplication" && selectedReapplicationIds.length > 0 && (
            <div className="alert alert-info py-2">
              {selectedReapplicationIds.length} re-application request(s) selected.
            </div>
          )}

          {activeQueue === "recommendation" && (
            <div className="table-responsive" style={{ maxHeight: "70vh" }}>
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    {!readOnly && (
                      <th>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(event) => toggleAll(event.target.checked)}
                        />
                      </th>
                    )}
                    <th>Name</th>
                    <th>Matric / Application</th>
                    <th>Financial</th>
                    <th>Document</th>
                    <th>Stationaries</th>
                    <th>Stage</th>
                    {!readOnly && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={readOnly ? 6 : 8}
                        className="text-center text-muted py-4"
                      >
                        Loading...
                      </td>
                    </tr>
                  )}

                  {!loading && groupedRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={readOnly ? 6 : 8}
                        className="text-center text-muted py-4"
                      >
                        No records found
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    groupedRows.map((row) => (
                      <tr key={row.key}>
                        {!readOnly && (
                          <td>
                            <input
                              type="checkbox"
                              checked={Boolean(selected[row.key])}
                              onChange={() => toggleRow(row.key)}
                            />
                          </td>
                        )}
                        <td>{row.name}</td>
                        <td>
                          <div>Matric: {row.matric || "-"}</div>
                          <div>Application: {row.application || "-"}</div>
                        </td>
                        <td>{renderFinancial(row.financial)}</td>
                        <td>{renderDocument(row.document)}</td>
                        <td>{renderStationary(row.stationary)}</td>
                        <td>
                          {readOnly ? (
                            <>
                              <div>{row.items[0]?.review_stage || "-"}</div>
                              <div>Status: {row.items[0]?.status || "-"}</div>
                            </>
                          ) : (
                            <>
                              <div>{isHodStage ? "hod" : "registrar"}</div>
                              <div>/</div>
                              <div>{isHodStage ? "hod" : "registrar"}</div>
                            </>
                          )}
                        </td>
                        {!readOnly && (
                          <td>
                            {row.actionableItems.length ? (
                              <div className="d-flex flex-column gap-2">
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() =>
                                    updateStatus(
                                      row.actionableItems.map((item) => item.id),
                                      "approve"
                                    )
                                  }
                                >
                                  {approveRowText}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() =>
                                    updateStatus(
                                      row.actionableItems.map((item) => item.id),
                                      "reject"
                                    )
                                  }
                                >
                                  {rejectRowText}
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted">Processed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {isHodStage && activeQueue === "reapplication" && (
            <div className="table-responsive" style={{ maxHeight: "70vh" }}>
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={allReapplicationsSelected}
                        onChange={(event) =>
                          toggleAllReapplications(event.target.checked)
                        }
                      />
                    </th>
                    <th>Name</th>
                    <th>Matric / Application</th>
                    <th>Original Undertaking</th>
                    <th>Reason</th>
                    <th>Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!loading && reapplications.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">
                        No re-application requests found
                      </td>
                    </tr>
                  )}

                  {reapplications.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedReapplications[item.id])}
                          onChange={() =>
                            setSelectedReapplications((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                        />
                      </td>
                      <td>{getStudentName(item)}</td>
                      <td>
                        <div>Matric: {item.matric_number || "-"}</div>
                        <div>Application: {getApplicationNo(item)}</div>
                      </td>
                      <td>
                        <div>{item.invoice_code}</div>
                        <div>Status: {item.status}</div>
                      </td>
                      <td>{item.reapplication_reason || "-"}</td>
                      <td>{item.reapplication_requested_at || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
