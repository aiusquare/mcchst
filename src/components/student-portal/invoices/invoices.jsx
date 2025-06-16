import { useState } from "react";
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

  const handleFetchData = async () => {
    const invoiceData = {
      email: userEmail,
    };

    await request
      .post(baseUrl + "invoices/get_invoices_by_email/")
      .type("application/json")
      .send(invoiceData)
      .then((response) => {
        setInvoices(response.body);
      })
      .catch((err) => {
        // let errorText = err.response.text;
        // console.log("Error message:", err.response);
      });
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const filteredInvoices =
    filter === "All Entries"
      ? invoices
      : invoices.filter((inv) => inv.status === filter);

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
            <MDBDropdownItem link onClick={() => setFilter("UnPaid")}>
              UnPaid
            </MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
      </div>

      <Table hover responsive bordered>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((invoice, index) => (
            <tr
              key={index}
              onClick={() => handleInvoiceClick(invoice.invoice_code)}
              style={{ cursor: "pointer" }}
            >
              <td>{invoice.invoice_code}</td>
              <td>{invoice.invoice_date}</td>
              <td>{invoice.due_date}</td>
              <td>{invoice.amount}</td>
              <td
                style={{ color: invoice.status === "Paid" ? "green" : "red" }}
                className="fw-bold"
              >
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
