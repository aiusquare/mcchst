import { useEffect, useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import request from "superagent";
import { baseUrl } from "../../../../services/setup";
import { fetchFile } from "../../../../utils/fetch-file";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDisplayAmounts = (entry) => {
  const rawDebit = Number(entry.debit_amount || 0);
  const rawCredit = Number(entry.credit_amount || 0);
  const description = String(entry.description || "").toLowerCase();
  const looksLikeWalletCredit =
    /wallet deposit|deposit|refund|credited|credit received|receiver|received/.test(
      description,
    );

  if (looksLikeWalletCredit && rawDebit > 0 && rawCredit === 0) {
    return { debit: 0, credit: rawDebit };
  }

  return { debit: rawDebit, credit: rawCredit };
};

const emptyStatement = {
  entries: [],
  opening_balance: 0,
  closing_balance: 0,
  total_debit: 0,
  total_credit: 0,
  total_rows: 0,
  table_missing: false,
};

const StudentTransactionsList = () => {
  const userEmail = localStorage.getItem("userEmail");
  const [statement, setStatement] = useState(emptyStatement);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "all",
    search: "",
  });

  const [showRequery, setShowRequery] = useState(false);
  const [requeryDate, setRequeryDate] = useState("");
  const [requeryLoading, setRequeryLoading] = useState(false);
  const [requeryResult, setRequeryResult] = useState(null);

  const entries = useMemo(
    () => (Array.isArray(statement.entries) ? statement.entries : []),
    [statement.entries],
  );

  const fetchStatement = async (nextFilters = filters) => {
    if (!userEmail) {
      setError("Unable to identify logged-in user.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await request
        .post(`${baseUrl}transactions/account_statement`)
        .type("application/json")
        .send({
          userEmail,
          ...nextFilters,
          limit: 200,
        });

      const payload = response.body?.data || emptyStatement;
      setStatement({
        ...emptyStatement,
        ...payload,
        entries: Array.isArray(payload.entries) ? payload.entries : [],
      });
    } catch (err) {
      setError(
        err?.response?.body?.message ||
          "Unable to load account statement right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchStatement(filters);
  };

  const clearFilters = () => {
    const reset = { startDate: "", endDate: "", type: "all", search: "" };
    setFilters(reset);
    fetchStatement(reset);
  };

  const handleRequery = async () => {
    if (!userEmail) return;
    try {
      setRequeryLoading(true);
      setRequeryResult(null);
      const body = { userEmail };
      if (requeryDate) body.date = requeryDate;
      const response = await request
        .post(`${baseUrl}billing/requery_dva_payment`)
        .type("application/json")
        .send(body);
      setRequeryResult(response.body);
      // Refresh the statement after a short delay so a webhook-credited amount appears.
      if (response.body?.success) {
        setTimeout(() => fetchStatement(filters), 6000);
      }
    } catch (err) {
      setRequeryResult({
        success: false,
        error:
          err?.response?.body?.error ||
          "Could not reach the server. Please try again.",
      });
    } finally {
      setRequeryLoading(false);
    }
  };

  const printReceipt = (reference) => {
    if (!reference) return;
    fetchFile(
      "https://api.mcchstfuntua.edu.ng/data/receipt/index.php",
      {
        pay_code: reference,
        mode: "transaction",
      },
      "Printing",
      "Please wait...",
      "receipt.pdf",
    );
  };

  return (
    <div className="p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h3 className="mb-1">Account Statement</h3>
          <div className="text-muted">
            Trace money added, refunds, payments, and your wallet balance.
          </div>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => fetchStatement(filters)}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {statement.table_missing && (
        <div className="alert alert-warning">
          Account statement ledger table is not available yet. Run the backend
          ledger migration to enable full tracing.
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* DVA delayed-transfer requery panel */}
      <div className="border rounded bg-white p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <strong>Payment not showing?</strong>
            <span className="text-muted ms-2 small">
              If you sent a bank transfer to your dedicated account and it
              hasn&apos;t appeared here, use this to request a recheck.
            </span>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              setShowRequery((v) => !v);
              setRequeryResult(null);
            }}
          >
            {showRequery ? "Hide" : "Recheck delayed transfer"}
          </button>
        </div>

        {showRequery && (
          <div className="mt-3 pt-3 border-top">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">
                  Date of transfer{" "}
                  <span className="text-muted small">(optional)</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={requeryDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setRequeryDate(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button
                  className="btn btn-primary"
                  onClick={handleRequery}
                  disabled={requeryLoading}
                >
                  {requeryLoading
                    ? "Checking with Paystack..."
                    : "Recheck my bank transfer"}
                </button>
              </div>
            </div>
            {requeryResult && (
              <div
                className={`alert mt-3 mb-0 alert-${
                  requeryResult.success ? "success" : "danger"
                }`}
              >
                {requeryResult.success
                  ? requeryResult.message
                  : requeryResult.error || "Something went wrong."}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border rounded bg-white p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-2">
            <label className="form-label">From</label>
            <input
              type="date"
              className="form-control"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">To</label>
            <input
              type="date"
              className="form-control"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Show</label>
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="all">All entries</option>
              <option value="credit">Credit only</option>
              <option value="debit">Debit only</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Search</label>
            <input
              type="search"
              className="form-control"
              placeholder="Reference or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
            />
          </div>
          <div className="col-md-2 d-flex gap-2">
            <button className="btn btn-primary w-100" onClick={applyFilters}>
              Apply
            </button>
            <button className="btn btn-light" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <Table hover responsive bordered className="bg-white align-middle">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>Description</th>
            <th className="text-end text-success">Credit</th>
            <th className="text-end text-danger">Debit</th>
            <th className="text-end">Balance</th>
            <th>Print</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan="7" className="text-center py-4 text-muted">
                Loading account statement...
              </td>
            </tr>
          )}

          {!loading && entries.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center py-4 text-muted">
                No statement entries found.
              </td>
            </tr>
          )}

          {!loading &&
            entries.map((entry) => {
              const { debit, credit } = getDisplayAmounts(entry);
              return (
                <tr key={entry.id || entry.reference}>
                  <td>{formatDate(entry.entry_date)}</td>
                  <td className="fw-semibold">{entry.reference}</td>
                  <td style={{ minWidth: 260 }}>{entry.description || "-"}</td>
                  <td className="text-end text-success fw-semibold">
                    {credit > 0 ? formatCurrency(credit) : "-"}
                  </td>
                  <td className="text-end text-danger fw-semibold">
                    {debit > 0 ? formatCurrency(debit) : "-"}
                  </td>
                  <td className="text-end">
                    {entry.balance_after === null
                      ? "-"
                      : formatCurrency(entry.balance_after)}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => printReceipt(entry.reference)}
                    >
                      Print
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </div>
  );
};

export default StudentTransactionsList;
