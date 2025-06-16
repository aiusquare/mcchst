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
import Swal from "sweetalert2";
import { loader } from "../../LoadingSpinner";
import { Toast } from "../../errorNotifier";

const ListOfAdminInvoices = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("All Entries");
  const [invoices, setInvoices] = useState([]);

  const handleFetchData = async () => {
    await request
      .get(baseUrl + "invoices/get_invoice_list/")
      .type("application/json")
      .then((response) => {
        setInvoices(response.body);
        // console.log("RET INVOICES LIST", response.body);
      })
      .catch((err) => {
        // let errorText = err.response.text;
        // console.log("Error message:", err.response);
      });
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleRemoveInvoice = async (invoiceCode) => {
    const { value: inputText } = await Swal.fire({
      title: "Confirm Deletion",
      text: `Type "confirm" to delete the invoice: ${invoiceCode}`,
      input: "text",
      inputPlaceholder: "Type confirm",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
      preConfirm: (value) => {
        if (value.toLowerCase() !== "confirm") {
          Swal.showValidationMessage('You must type "confirm" to proceed');
        }
      },
    });

    if (inputText && inputText.toLowerCase() === "confirm") {
      loader({
        title: "Deleting!",
        text: "Please! wait.",
      });

      const incoiceData = {
        invoiceCode: invoiceCode,
      };

      await request
        .post(baseUrl + "invoices/delete_invoice")
        .type("application/json")
        .send(incoiceData)
        .then((response) => {
          Toast.fire({
            icon: "success",
            title: "Invoice deleted successfully",
          });

          window.location.reload();
        })
        .catch((err) => {
          // let errorText = err.response.text;
          console.log("Error message:", err.response);

          Swal.fire({
            title: "Error!",
            text: err.response,
            icon: "error",
          });
        });
    }
  };

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
              Opened
            </MDBDropdownItem>
            <MDBDropdownItem link onClick={() => setFilter("UnPaid")}>
              Closed
            </MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
      </div>

      <Table hover responsive bordered>
        <thead>
          <tr>
            <th>SN</th>
            <th>Programme </th>
            <th>Invoice Title </th>
            <th>Target Session</th>
            <th>Amount</th>
            <th>Invoice Code</th>
            <th>Invoice Date</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((invoice, index) => (
            <tr
              key={index}
              // onClick={() => handleInvoiceClick(invoice.invoice_code)}
              // style={{ cursor: "pointer" }}
            >
              <td>{index + 1}</td>
              <td>{invoice.programme}</td>
              <td>{invoice.title}</td>
              <td>{invoice.sessionOfEntry}</td>
              <td>{invoice.amount}</td>
              <td>{invoice.invoice_code}</td>
              <td>{invoice.invoice_date}</td>
              <td className="fw-bold">
                <button
                  className="btn btn-sm btn-danger ms-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveInvoice(invoice.invoice_code);
                  }}
                >
                  <i className="fas fa-trash-alt me-1"></i> Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ListOfAdminInvoices;
