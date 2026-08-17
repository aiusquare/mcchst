import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Toast } from "../../../components/errorNotifier";
import { baseUrl } from "../../../services/setup";

const LIST_ENDPOINT = `${baseUrl}finance/list_settlement_accounts`;
const CREATE_ENDPOINT = `${baseUrl}finance/create_settlement_account`;
const UPDATE_ENDPOINT = `${baseUrl}finance/update_settlement_account`;
const DELETE_ENDPOINT = `${baseUrl}finance/delete_settlement_account`;

const INITIAL_FORM = {
  accTitle: "",
  name: "",
  bankName: "",
  accountNumber: "",
  code: "",
  recipientCode: "",
};

const toString = (value) =>
  value === null || value === undefined ? "" : String(value);

const normalizeSettlement = (row, index) => {
  const recordId =
    row?.id ??
    row?.ID ??
    row?.settlement_id ??
    row?.settlementId ??
    row?.account_id ??
    row?.accountId ??
    "";

  const accountNumber = toString(
    row?.account_number ??
      row?.accountNumber ??
      row?.acct_number ??
      row?.acctNumber,
  );

  const key = toString(recordId || accountNumber || `row-${index}`);

  return {
    key,
    identifier: toString(recordId || accountNumber),
    accTitle: toString(
      row?.acc_title ?? row?.accTitle ?? row?.account_title ?? row?.title,
    ),
    name: toString(row?.name ?? row?.account_name ?? row?.holder_name),
    bankName: toString(row?.bank_name ?? row?.bankName),
    accountNumber,
    code: toString(row?.code ?? row?.bank_code ?? row?.branch_code),
    recipientCode: toString(row?.recipient_code ?? row?.recipientCode),
  };
};

const extractRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const hasExplicitFailure = (payload) => {
  if (!payload) return false;
  if (payload?.status === false || payload?.success === false) return true;

  const statusText = toString(payload?.status || payload?.result).toLowerCase();
  return ["failed", "error", "false", "0"].includes(statusText);
};

const extractErrorMessage = (payload, fallback) =>
  toString(payload?.message || payload?.error || payload?.details) || fallback;

const buildPayload = ({
  formData,
  identifier,
  previousAccountNumber,
  actor,
}) => {
  const payload = {
    acc_title: formData.accTitle.trim(),
    account_title: formData.accTitle.trim(),
    name: formData.name.trim(),
    bank_name: formData.bankName.trim(),
    account_number: formData.accountNumber.trim(),
    code: formData.code.trim(),
    recipient_code: formData.recipientCode.trim(),
  };

  if (identifier) {
    payload.id = identifier;
    payload.settlement_id = identifier;
    payload.identifier = identifier;
  }

  if (previousAccountNumber) {
    payload.previous_account_number = previousAccountNumber;
    payload.old_account_number = previousAccountNumber;
  }

  if (actor) {
    payload.officer = actor;
    payload.user_id = actor;
  }

  return payload;
};

const SettlementCreation = () => {
  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loadingRows, setLoadingRows] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const formCardRef = useRef(null);
  const firstInputRef = useRef(null);

  const fetchRows = async () => {
    setLoadingRows(true);

    try {
      let response;
      try {
        response = await axios.get(LIST_ENDPOINT);
      } catch (error) {
        response = await axios.post(LIST_ENDPOINT, {});
      }

      const settlements = extractRows(response.data).map(normalizeSettlement);
      setRows(settlements);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Failed to load settlement accounts",
      });
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingItem(null);
  };

  const validateForm = () => {
    const requiredValues = [
      formData.accTitle,
      formData.name,
      formData.bankName,
      formData.accountNumber,
      formData.code,
    ];
    return requiredValues.every((value) => value.trim());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      Toast.fire({
        icon: "warning",
        title: "All settlement fields are required",
      });
      return;
    }

    const actor = localStorage.getItem("userId") || "";
    const payload = buildPayload({
      formData,
      identifier: editingItem?.identifier,
      previousAccountNumber: editingItem?.accountNumber,
      actor,
    });

    setSubmitting(true);
    try {
      const response = await axios.post(
        editingItem ? UPDATE_ENDPOINT : CREATE_ENDPOINT,
        payload,
      );

      if (hasExplicitFailure(response.data)) {
        throw new Error(extractErrorMessage(response.data, "Request failed"));
      }

      Toast.fire({
        icon: "success",
        title: editingItem
          ? "Settlement account updated"
          : "Settlement account created",
      });

      resetForm();
      await fetchRows();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save settlement account",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (row) => {
    setEditingItem(row);
    setFormData({
      accTitle: row.accTitle,
      name: row.name,
      bankName: row.bankName,
      accountNumber: row.accountNumber,
      code: row.code,
      recipientCode: row.recipientCode,
    });
    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setTimeout(() => {
      if (firstInputRef.current) firstInputRef.current.focus();
    }, 400);
  };

  const handleDelete = async (row) => {
    if (!row.identifier) {
      Toast.fire({
        icon: "error",
        title: "Unable to identify this settlement account",
      });
      return;
    }

    const confirmed = window.confirm(
      "Delete this settlement account? This action cannot be undone.",
    );
    if (!confirmed) return;

    const payload = {
      id: row.identifier,
      settlement_id: row.identifier,
      identifier: row.identifier,
      account_number: row.accountNumber,
      code: row.code,
    };

    setDeletingId(row.key);
    try {
      const response = await axios.post(DELETE_ENDPOINT, payload);
      if (hasExplicitFailure(response.data)) {
        throw new Error(
          extractErrorMessage(
            response.data,
            "Failed to delete settlement account",
          ),
        );
      }

      Toast.fire({
        icon: "success",
        title: "Settlement account deleted",
      });

      if (editingItem?.key === row.key) {
        resetForm();
      }

      await fetchRows();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete settlement account",
      });
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm mb-4" ref={formCardRef}>
        <div className="card-header">
          <h4 className="mb-0">
            {editingItem
              ? "Edit Settlement Account"
              : "Settlement Account Creation"}
          </h4>
        </div>
        <div className="card-body">
          <p className="text-muted mb-4">
            Create settlement accounts and maintain the list for payment
            settlement.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="accTitle" className="form-label">
                  Acc Title
                </label>
                <input
                  id="accTitle"
                  name="accTitle"
                  className="form-control"
                  ref={firstInputRef}
                  value={formData.accTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Main Settlement Account"
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Account holder name"
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="bankName" className="form-label">
                  Bank Name
                </label>
                <input
                  id="bankName"
                  name="bankName"
                  className="form-control"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Bank name"
                  required
                />
              </div>

              <div className="col-md-3">
                <label htmlFor="accountNumber" className="form-label">
                  Account Number
                </label>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  className="form-control"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Account number"
                  required
                />
              </div>

              <div className="col-md-3">
                <label htmlFor="code" className="form-label">
                  Code
                </label>
                <input
                  id="code"
                  name="code"
                  className="form-control"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Code"
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="recipientCode" className="form-label">
                  Recipient Code
                </label>
                <input
                  id="recipientCode"
                  name="recipientCode"
                  className="form-control"
                  value={formData.recipientCode}
                  onChange={handleInputChange}
                  placeholder="e.g. RCP_xxxxxxxxxx"
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? editingItem
                    ? "Updating..."
                    : "Creating..."
                  : editingItem
                    ? "Update Settlement"
                    : "Create Settlement"}
              </button>
              {editingItem && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Settlement Accounts</h5>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={fetchRows}
            disabled={loadingRows}
          >
            {loadingRows ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Acc Title</th>
                  <th>Name</th>
                  <th>Bank Name</th>
                  <th>Account Number</th>
                  <th>Code</th>
                  <th>Recipient Code</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loadingRows && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No settlement account found
                    </td>
                  </tr>
                )}

                {rows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.accTitle || "-"}</td>
                    <td>{row.name || "-"}</td>
                    <td>{row.bankName || "-"}</td>
                    <td>{row.accountNumber || "-"}</td>
                    <td>{row.code || "-"}</td>
                    <td>{row.recipientCode || "-"}</td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(row)}
                          disabled={submitting}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(row)}
                          disabled={deletingId === row.key}
                        >
                          {deletingId === row.key ? "Deleting..." : "Delete"}
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
};

export default SettlementCreation;
