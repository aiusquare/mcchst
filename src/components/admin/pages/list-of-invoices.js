import { useEffect, useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import {
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBDropdownItem,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import request from "superagent";
import { baseUrl } from "../../../services/setup";
import Swal from "sweetalert2";
import { Toast } from "../../../utils/toast";
import { loader } from "../../../utils/loading-spinner";

const getUniqueOptions = (rows, fieldName) =>
  Array.from(
    new Set(
      rows
        .map((invoice) => invoice?.[fieldName])
        .filter((value) => value !== null && value !== undefined && value !== ""),
    ),
  ).sort((a, b) => String(a).localeCompare(String(b)));

const ListOfAdminInvoices = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("All Entries");
  const [searchTerm, setSearchTerm] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [priorityCodeFilter, setPriorityCodeFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [cancellingCode, setCancellingCode] = useState("");

  const handleFetchData = async () => {
    await request
      .get(baseUrl + "invoices/get_invoice_list/")
      .type("application/json")
      .then((response) => {
        setInvoices(response.body);
        console.log("RET INVOICES LIST", response.body);
      })
      .catch((err) => {
        // let errorText = err.response.text;
        // console.log("Error message:", err.response);
      });
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const isPaidInvoice = (invoice) =>
    (invoice?.status || "").toLowerCase() === "paid";

  const isCanceledInvoice = (invoice) =>
    (invoice?.mode || "").toLowerCase() === "canceled";

  const isIssuedInvoice = (invoice) =>
    Number.parseInt(invoice?.assignment_count, 10) > 0;

  const normalizeText = (value) =>
    value === null || value === undefined ? "" : String(value).toLowerCase();

  const getTargetLabel = (invoice) => {
    const targetType = invoice?.target_type || invoice?.target;
    if (targetType === "general") return "General";
    if (targetType === "department") return "Department";
    if (targetType === "session") return "Session";
    if (targetType === "student") return "Student";
    if (targetType === "specific") return "Specific";
    return targetType || "Unspecified";
  };

  const programmeOptions = useMemo(
    () => getUniqueOptions(invoices, "programme"),
    [invoices],
  );
  const sessionOptions = useMemo(
    () => getUniqueOptions(invoices, "sessionOfEntry"),
    [invoices],
  );
  const priorityCodeOptions = useMemo(
    () => getUniqueOptions(invoices, "invoice_priority_code"),
    [invoices],
  );
  const targetOptions = useMemo(
    () =>
      Array.from(new Set(invoices.map((invoice) => getTargetLabel(invoice))))
        .filter(Boolean)
        .sort(),
    [invoices],
  );

  const handleRemoveInvoice = async (invoice) => {
    if (!invoice?.invoice_code) {
      Toast.fire({ icon: "error", title: "Missing invoice code" });
      return;
    }

    if (isIssuedInvoice(invoice)) {
      Toast.fire({
        icon: "warning",
        title: "Issued invoices cannot be deleted",
        text: "Cancel the invoice instead so it remains visible in student and finance history.",
      });
      return;
    }

    const invoiceCode = invoice.invoice_code;

    const { value: inputText } = await Swal.fire({
      title: "Confirm Deletion",
      text: `Type "confirm" to delete the unused draft invoice: ${invoiceCode}`,
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

      const invoiceData = {
        invoiceCode: invoiceCode,
      };

      await request
        .post(baseUrl + "invoices/delete_invoice_globally")
        .withCredentials()
        .type("application/json")
        .send(invoiceData)
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
          const errorData = err.response?.body;
          const errorMessage =
            errorData?.message ||
            errorData?.error ||
            "Failed to delete invoice";

          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
          });
        });
    }
  };

  const handleCancelInvoice = async (invoice) => {
    if (!invoice?.invoice_code) {
      Toast.fire({ icon: "error", title: "Missing invoice code" });
      return;
    }

    if (!isIssuedInvoice(invoice)) {
      Toast.fire({
        icon: "warning",
        title: "This invoice has not been issued",
        text: "Unused drafts can be removed. Cancellation is for issued invoices.",
      });
      return;
    }

    const invoiceCode = invoice.invoice_code;

    const { value: inputText } = await Swal.fire({
      title: "Cancel Invoice",
      text: `Type "cancel" to cancel the issued invoice: ${invoiceCode}\n\nIt will remain in financial history. Confirmed payments are refunded atomically by the backend.`,
      input: "text",
      inputPlaceholder: "Type cancel",
      showCancelButton: true,
      confirmButtonText: "Cancel Invoice",
      confirmButtonColor: "#ff9800",
      preConfirm: (value) => {
        if (value.toLowerCase() !== "cancel") {
          Swal.showValidationMessage('You must type "cancel" to proceed');
        }
      },
    });

    if (inputText && inputText.toLowerCase() === "cancel") {
      loader({
        title: "Cancelling!",
        text: "Please! wait.",
      });

      const invoiceData = {
        invoiceCode: invoiceCode,
      };

      setCancellingCode(invoiceCode);

      await request
        .post(baseUrl + "invoices/cancel_invoice")
        .withCredentials()
        .type("application/json")
        .send(invoiceData)
        .then((response) => {
          const result = response.body;
          Toast.fire({
            icon: "success",
            title: "Invoice cancelled successfully",
            text: result.message,
          });

          // Refresh the list
          handleFetchData();
        })
        .catch((err) => {
          console.log("Error message:", err.response);
          const errorData = err.response?.body;
          const errorMessage =
            errorData?.message ||
            errorData?.error ||
            "Failed to cancel invoice";

          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
          });
        })
        .finally(() => {
          setCancellingCode("");
        });
    }
  };

  const filteredInvoices = useMemo(() => {
    const search = normalizeText(searchTerm).trim();

    return invoices.filter((invoice) => {
      const matchesStatus =
        filter === "All Entries" ||
        (filter === "Canceled"
          ? isCanceledInvoice(invoice)
          : filter === "Unpaid"
            ? !isCanceledInvoice(invoice) && !isPaidInvoice(invoice)
            : !isCanceledInvoice(invoice) &&
              normalizeText(invoice.status) === filter.toLowerCase());

      const matchesProgramme =
        !programmeFilter || invoice.programme === programmeFilter;
      const matchesSession =
        !sessionFilter || invoice.sessionOfEntry === sessionFilter;
      const matchesPriorityCode =
        !priorityCodeFilter ||
        invoice.invoice_priority_code === priorityCodeFilter;
      const matchesTarget =
        !targetFilter || getTargetLabel(invoice) === targetFilter;

      const searchableText = [
        invoice.invoice_code,
        invoice.invoice_priority_code,
        invoice.title,
        invoice.programme,
        invoice.sessionOfEntry,
        invoice.amount,
        invoice.invoice_date,
        invoice.priority,
        getTargetLabel(invoice),
      ]
        .map(normalizeText)
        .join(" ");

      const matchesSearch = !search || searchableText.includes(search);

      return (
        matchesStatus &&
        matchesProgramme &&
        matchesSession &&
        matchesPriorityCode &&
        matchesTarget &&
        matchesSearch
      );
    });
  }, [
    filter,
    invoices,
    priorityCodeFilter,
    programmeFilter,
    searchTerm,
    sessionFilter,
    targetFilter,
  ]);

  const clearFilters = () => {
    setFilter("All Entries");
    setSearchTerm("");
    setProgrammeFilter("");
    setSessionFilter("");
    setPriorityCodeFilter("");
    setTargetFilter("");
  };

  return (
    <div
      className="p-3 p-md-4"
      style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}
    >
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
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
            <MDBDropdownItem link onClick={() => setFilter("Canceled")}>
              Canceled
            </MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>

        <div className="text-muted">
          Showing {filteredInvoices.length} of {invoices.length}
        </div>
      </div>

      <div className="row g-2 mb-3" style={{ minWidth: 0 }}>
        <div className="col-12 col-lg-4" style={{ minWidth: 0 }}>
          <input
            className="form-control"
            placeholder="Search title, code, programme, amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-6 col-lg-2" style={{ minWidth: 0 }}>
          <select
            className="form-select"
            value={priorityCodeFilter}
            onChange={(e) => setPriorityCodeFilter(e.target.value)}
          >
            <option value="">All priority codes</option>
            {priorityCodeOptions.map((code) => (
              <option value={code} key={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-lg-2" style={{ minWidth: 0 }}>
          <select
            className="form-select"
            value={programmeFilter}
            onChange={(e) => setProgrammeFilter(e.target.value)}
          >
            <option value="">All programmes</option>
            {programmeOptions.map((programme) => (
              <option value={programme} key={programme}>
                {programme}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-lg-2" style={{ minWidth: 0 }}>
          <select
            className="form-select"
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
          >
            <option value="">All sessions</option>
            {sessionOptions.map((session) => (
              <option value={session} key={session}>
                {session}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-lg-2" style={{ minWidth: 0 }}>
          <select
            className="form-select"
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
          >
            <option value="">All targets</option>
            {targetOptions.map((target) => (
              <option value={target} key={target}>
                {target}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "100%", overflowX: "auto" }}>
        <Table
          hover
          bordered
          style={{ minWidth: "1180px", marginBottom: 0, tableLayout: "fixed" }}
        >
        <thead>
          <tr>
            <th>SN</th>
            <th>Priority Code</th>
            <th>Priority</th>
            <th>Programme </th>
            <th>Invoice Title </th>
            <th>Target</th>
            <th>Target Session</th>
            <th>Amount</th>
            <th>Invoice Code</th>
            <th>Invoice Date</th>
            <th>Action</th>
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
              <td>
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#05321e",
                    padding: "2px 8px",
                    backgroundColor: "#e8f5e9",
                    borderRadius: "4px",
                  }}
                >
                  {invoice.invoice_priority_code || "N/A"}
                </span>
              </td>
              <td>
                <span
                  style={{
                    fontWeight: "bold",
                    color:
                      invoice.priority > 5
                        ? "#d32f2f"
                        : invoice.priority > 0
                          ? "#f57c00"
                          : "#757575",
                  }}
                >
                  {invoice.priority || 0}
                </span>
              </td>
              <td>{invoice.programme}</td>
              <td>{invoice.title}</td>
              <td>{getTargetLabel(invoice)}</td>
              <td>{invoice.sessionOfEntry}</td>
              <td>{invoice.amount}</td>
              <td>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {invoice.invoice_code}
                  {invoice.mode === "canceled" && (
                    <span
                      style={{
                        display: "inline-block",
                        backgroundColor: "#f44336",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                      }}
                      title="This invoice has been canceled"
                    >
                      CANCELED
                    </span>
                  )}
                  {invoice.status === "Paid" && invoice.mode !== "canceled" && (
                    <span
                      style={{
                        display: "inline-block",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        title: "This invoice has received payments",
                      }}
                      title="This invoice has received payments and cannot be edited or deleted"
                    >
                      PAID
                    </span>
                  )}
                </div>
              </td>
              <td>{invoice.invoice_date}</td>
              <td className="fw-bold">
                {!isIssuedInvoice(invoice) && !isCanceledInvoice(invoice) && (
                  <button
                    className="btn btn-sm btn-danger ms-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveInvoice(invoice);
                    }}
                    title="Delete unused draft invoice"
                  >
                    <i className="fas fa-trash-alt "></i> Delete Draft
                  </button>
                )}

                <button
                  className="btn  btn-info ms-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/edit-invoice`, {
                      state: { invoiceData: invoice },
                    });
                  }}
                  disabled={invoice.mode === "canceled"}
                  title={
                    invoice.mode === "canceled"
                      ? "This invoice has been canceled and cannot be modified"
                      : invoice.status === "Paid"
                        ? "Edit title and priority metadata only"
                        : "Edit invoice"
                  }
                >
                  <i className="fas fa-edit me-1"></i> Edit
                </button>

                {isIssuedInvoice(invoice) && !isCanceledInvoice(invoice) && (
                  <button
                    className="btn btn-sm btn-warning ms-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelInvoice(invoice);
                    }}
                    disabled={cancellingCode === invoice.invoice_code}
                    title="Cancel issued invoice"
                  >
                    <i className="fas fa-times me-1"></i>
                    {cancellingCode === invoice.invoice_code
                      ? "Cancelling..."
                      : "Cancel"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ListOfAdminInvoices;
