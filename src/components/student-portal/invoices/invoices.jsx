import { useCallback, useState } from "react";
import { Table } from "react-bootstrap";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import {
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBDropdownItem,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import request from "superagent";
import { baseUrl } from "../../../services/setup";

const InvoiceList = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("All Entries");
  const userEmail = localStorage.getItem("userEmail");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const handleFetchData = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    if (!userEmail) {
      setLoadError(
        "Session expired. Please log in again to view your invoices.",
      );
      setLoading(false);
      return;
    }

    const invoiceData = {
      email: userEmail,
    };

    await request
      .post(baseUrl + "invoices/get_invoices_by_email/")
      .type("application/json")
      .send(invoiceData)
      .then((response) => {
        const data = Array.isArray(response.body) ? response.body : [];
        // sort: higher priority first, then by priority code asc, then invoice code asc
        const sorted = [...data].sort((a, b) => {
          const pa = parseInt(a.priority, 10) || 0;
          const pb = parseInt(b.priority, 10) || 0;
          if (pb !== pa) return pb - pa;
          const ca = (a.invoice_priority_code || "").toString();
          const cb = (b.invoice_priority_code || "").toString();
          if (ca !== cb) return ca.localeCompare(cb);
          return (a.invoice_code || "").localeCompare(b.invoice_code || "");
        });
        setInvoices(sorted);
      })
      .catch((err) => {
        setLoadError(
          err.response?.body?.message ||
            err.response?.body?.error ||
            "Invoices could not be loaded. Please retry or contact finance.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userEmail]);

  useEffect(() => {
    handleFetchData();
  }, [handleFetchData]);

  const filteredInvoices =
    filter === "All Entries"
      ? invoices
      : invoices.filter(
          (inv) => (inv.status || "").toLowerCase() === filter.toLowerCase(),
        );

  const getStatusStyle = (status) => {
    const normalized = (status || "").toLowerCase();
    if (normalized === "paid") return { color: "green" };
    if (normalized === "partial") return { color: "#ff9800" };
    return { color: "red" };
  };

  const handleInvoiceClick = (id) => {
    const invoiceData = filteredInvoices.find((inv) => inv.invoice_code === id);

    navigate(`/portal/invoice`, { state: { invoiceData: invoiceData } });
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <MDBDropdown group className="shadow-0">
          <MDBDropdownToggle color="light">{filter}</MDBDropdownToggle>
          <MDBDropdownMenu>
            <MDBDropdownItem link onClick={() => setFilter("All Entries")}>
              All Entries
            </MDBDropdownItem>
            <MDBDropdownItem link onClick={() => setFilter("Paid")}>
              Paid
            </MDBDropdownItem>
            <MDBDropdownItem link onClick={() => setFilter("Unpaid")}>
              Unpaid
            </MDBDropdownItem>
            <MDBDropdownItem link onClick={() => setFilter("Partial")}>
              Partial
            </MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
      </div>

      {loadError && (
        <div className="alert alert-danger" role="alert">
          {loadError}{" "}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={handleFetchData}
          >
            Retry
          </button>
        </div>
      )}

      <Table hover responsive bordered>
        <thead>
          <tr>
            <th>Priority Code</th>
            <th>Priority</th>
            <th>Invoice #</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan="7" className="text-center">
                Loading invoices...
              </td>
            </tr>
          )}
          {!loading && !loadError && filteredInvoices.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center">
                No invoices were returned for this account.
              </td>
            </tr>
          )}
          {filteredInvoices.map((invoice, index) => (
            <tr
              key={index}
              onClick={() => handleInvoiceClick(invoice.invoice_code)}
              style={{ cursor: "pointer" }}
            >
              <td>{invoice.invoice_priority_code || "N/A"}</td>
              <td>{parseInt(invoice.priority, 10) || 0}</td>
              <td>{invoice.invoice_code}</td>
              <td>{invoice.invoice_date}</td>
              <td>{invoice.due_date}</td>
              <td>{invoice.amount}</td>
              <td style={getStatusStyle(invoice.status)} className="fw-bold">
                <i className="fas fa-check-circle me-1"></i>
                {invoice.status}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default InvoiceList;
