import { useState } from "react";
import request from "superagent";
import { baseUrl } from "../../../../services/setup";
import {
  MDBDropdown,
  MDBDropdownItem,
  MDBDropdownMenu,
  MDBDropdownToggle,
} from "mdb-react-ui-kit";
import { Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../../utils/formatCurrency";

// Admission Confirmation Component
const Scholarship = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasInvoice, setHasInvoices] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [waiverAmount, setWaiverAmount] = useState(0);
  const [studentInfo, setStudentInfo] = useState(null);
  const [selectedPayId, setSelectedPayId] = useState(null);
  const [waiverByPayId, setWaiverByPayId] = useState({});

  const handleSearch = async () => {
    const term = searchTerm.trim();
    if (!term) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setUser(null);
    setStudentInfo(null);
    setInvoices([]);
    setHasInvoices(false);
    setIsVerified(false);
    setSelectedPayId(null);
    setWaiverByPayId({});

    try {
      // Fetch student details by email/matric/application/phone
      const studentRes = await request
        .post(baseUrl + "officers/fin_user_search")
        .type("application/json")
        .send({ searchId: term });

      const studentData = studentRes.body?.data;
      if (!studentData) {
        throw new Error(studentRes.body?.message || "Student not found");
      }
      setStudentInfo(studentData);

      const email = studentData.Email || term;
      const invoiceRes = await request
        .post(baseUrl + "invoices/get_invoices_by_email/")
        .type("application/json")
        .send({ email });

      const list = Array.isArray(invoiceRes.body) ? invoiceRes.body : [];
      setInvoices(list);
      setHasInvoices(list.length > 0);
      if (list.length === 0) {
        setError("No invoices found for this student");
      }
    } catch (err) {
      setError(err?.response?.body?.message || err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitScholarship = async () => {
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      if (!isVerified) {
        setError("Please check the verification box");
        return;
      }

      if (!selectedPayId) {
        setError("Select an invoice and enter the waiver amount");
        return;
      }

      const targetInvoice = invoices.find(
        (inv) => inv.pay_id === selectedPayId
      );
      if (!targetInvoice) {
        setError("Selected invoice not found");
        return;
      }

      const waiverAmountValue =
        waiverByPayId[selectedPayId] ??
        targetInvoice.waiver_amount ??
        waiverAmount ??
        0;
      const numericWaiver = parseFloat(waiverAmountValue) || 0;

      console.log("Submitting scholarship with waiver amount:", invoices);

      const response = await fetch(baseUrl + `Officers/registrar_scholarship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: targetInvoice.target_id,
          waiver_amount: numericWaiver,
          pay_id: targetInvoice.pay_id,
        }),
      });

      if (response.ok) {
        setSuccess("Submitted successfully");
        setHasInvoices(false);
        setInvoices([]);
        setUser(null);
        setSelectedPayId(null);
        setWaiverByPayId({});
      } else {
        throw new Error("Submission failed. Please try again.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <h4 className="mb-4 fw-bold">Student Scholarship</h4>

      <div className="row g-2 align-items-center mb-3 p-4">
        <div className="col-md-9">
          <label className="form-label">
            Email / Phone / Application / Matric
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter email, phone, application no, or matric"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div className="col-md-3 d-grid">
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
          >
            {loading ? (
              <div
                className="spinner-border spinner-border-sm text-light"
                role="status"
              />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success mb-3" role="alert">
          {success}
        </div>
      )}

      {studentInfo && (
        <div className="card mb-3">
          <div className="card-body">
            <div className="fw-semibold">{studentInfo.Fullname}</div>
            <div className="small text-muted">{studentInfo.Email}</div>
            <div className="small text-muted">
              {studentInfo.MatricNumber || studentInfo.ApplicationNo || "-"}
            </div>
            <div className="small">
              {studentInfo.Department} • {studentInfo.Programme}
            </div>
            <div className="small text-muted">
              Account balance: {formatCurrency(studentInfo.AccountBalance || 0)}
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          {hasInvoice && (
            <>
              <SchlInvoiceList
                invoices={invoices}
                setWaiverAmount={setWaiverAmount}
                onWaiverChange={(payId, val) => {
                  setSelectedPayId(payId);
                  setWaiverByPayId((prev) => ({ ...prev, [payId]: val }));
                  setWaiverAmount(val);
                  setInvoices((prev) =>
                    prev.map((inv) =>
                      inv.pay_id === payId
                        ? { ...inv, waiver_amount: val }
                        : inv
                    )
                  );
                }}
                selectedPayId={selectedPayId}
              />
              <div className="form-check my-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="verifyCheck"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="verifyCheck">
                  I Confirm his Scholarship.
                </label>
              </div>

              <button
                className="btn btn-success"
                onClick={handleSubmitScholarship}
                disabled={loading || !isVerified}
              >
                {loading ? (
                  <div
                    className="spinner-border spinner-border-sm text-light"
                    role="status"
                  />
                ) : (
                  "Submit"
                )}
              </button>
            </>
          )}
        </div>

        {/* Undertaking panel removed per request */}
      </div>
    </div>
  );
};

const SchlInvoiceList = (props) => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("All Entries");
  const [invoices, setInvoices] = useState(props.invoices || []);

  const filteredInvoices =
    filter === "All Entries"
      ? invoices
      : invoices.filter((inv) => inv.status === filter);

  const handleInvoiceClick = (id) => {
    const invoiceData = filteredInvoices.find((inv) => inv.invoice_code === id);

    navigate(`/admin/view-invoice`, { state: { invoiceData: invoiceData } });
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
            <MDBDropdownItem link onClick={() => setFilter("UnPaid")}>
              UnPaid
            </MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
      </div>

      <Table hover responsive bordered>
        <thead>
          <tr>
            <th>Invoice ID#</th>
            <th>Issue Date</th>
            <th>Total</th>
            <th>Waiver Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((invoice, index) => (
            <tr
              key={index}
              style={{ cursor: "pointer" }}
              className={
                invoice.pay_id === props.selectedPayId ? "table-success" : ""
              }
            >
              <td>{invoice.invoice_code}</td>
              <td>{invoice.invoice_date}</td>
              <td>{formatCurrency(invoice.amount)}</td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  name="Waiver Amount"
                  value={invoice.waiver_amount ?? ""}
                  onChange={(e) => {
                    const updatedInvoices = [...invoices];
                    updatedInvoices[index].waiver_amount = e.target.value;
                    setInvoices(updatedInvoices);
                    props.onWaiverChange?.(invoice.pay_id, e.target.value);
                  }}
                />
              </td>

              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => handleInvoiceClick(invoice.invoice_code)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Scholarship;
