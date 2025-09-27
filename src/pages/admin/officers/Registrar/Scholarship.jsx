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

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setUser(null);

    const invoiceData = {
      email: searchTerm.trim(),
    };

    await request
      .post(baseUrl + "invoices/get_invoices_by_email/")
      .type("application/json")
      .send(invoiceData)
      .then((response) => {
        setInvoices(response.body);
        setHasInvoices(true);
        setLoading(false);
      })
      .catch((err) => {
        // let errorText = err.response.text;
        // console.log("Error message:", err.response);
      });
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

      console.log("Submitting scholarship with waiver amount:", invoices);

      const response = await fetch(baseUrl + `Officers/registrar_scholarship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: invoices[0].target_id,
          waiver_amount: waiverAmount,
          pay_id: invoices[0].pay_id,
        }),
      });

      if (response.ok) {
        setSuccess("Submitted successfully");
        setHasInvoices(false);
        setInvoices([]);
        setUser(null);
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
          <input
            type="text"
            className="form-control"
            placeholder="Search by email"
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

      {hasInvoice && (
        <div>
          <div>
            <SchlInvoiceList
              invoices={invoices}
              setWaiverAmount={setWaiverAmount}
            />
            <input
              className="form-check-input mb-2"
              type="checkbox"
              id="verifyCheck"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
            />
            I Confirm his Scholarship.
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
        </div>
      )}
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
              // onClick={() => handleInvoiceClick(invoice.invoice_code)}
              style={{ cursor: "pointer" }}
            >
              <td>{invoice.invoice_code}</td>
              <td>{invoice.invoice_date}</td>
              <td>{formatCurrency(invoice.amount)}</td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  name="Waiver Amount"
                  value={invoice.waiver_amount ?? 0}
                  onChange={(e) => {
                    const updatedInvoices = [...invoices];
                    updatedInvoices[index].waiver_amount = e.target.value;
                    setInvoices(updatedInvoices);

                    props.setWaiverAmount(e.target.value);
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
