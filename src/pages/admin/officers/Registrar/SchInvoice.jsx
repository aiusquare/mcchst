import { useEffect } from "react";
import {
  MDBContainer,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBBadge,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";
import request from "superagent";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { baseUrl } from "../../../../services/setup";
import Swal from "sweetalert2";
import { Toast } from "../../../../utils/toast";
import { loader } from "../../../../utils/loading-spinner";
import { postData } from "../../../../utils/post-data";
import { fetchFile } from "../../../../utils/fetch-file";
import { formatCurrency } from "../../../../utils/formatCurrency";

const SchInvoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = localStorage.getItem("userEmail");
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [itemPaymentStatus, setItemPaymentStatus] = useState({});
  const [itemStatusLoading, setItemStatusLoading] = useState(false);
  const [itemStatusError, setItemStatusError] = useState("");
  const waiverAmount = parseFloat(invoiceData?.waiver_amount || 0);
  const netTotal = Math.max(0, (parseFloat(total) || 0) - waiverAmount);
  const [userBalance, setUserBalance] = useState(0);
  const [payCode, setPayCode] = useState("");

  useEffect(() => {
    if (location.state?.invoiceData) {
      const incData = location.state.invoiceData;

      setInvoiceData(incData);
      setPayCode(incData.pay_id);

      const fetchFeesList = async () => {
        const invoiceItems = await postData(
          baseUrl + "invoices/get_invoice_items_by_id/",
          {
            invoiceId: incData.invoice_code,
          },
        );

        if (invoiceItems) {
          const total = invoiceItems.reduce(
            (sum, item) => sum + (parseFloat(item.amount) || 0),
            0,
          );

          setTotal(total);
          setInvoiceItems(invoiceItems);
        }
      };

      // Fetch payment status for each item
      const fetchItemPaymentStatus = async () => {
        setItemStatusLoading(true);
        setItemStatusError("");
        try {
          const response = await request
            .post(baseUrl + "invoices/get_invoice_items_with_status/")
            .withCredentials()
            .type("application/json")
            .send({
              invoiceId: incData.invoice_code,
              email: incData.target_id,
            });

          if (response.body && Array.isArray(response.body.data)) {
            const statusMap = {};
            response.body.data.forEach((item) => {
              statusMap[item.item_id] = {
                status: item.payment_status,
                amount_paid: item.amount_paid,
                paid_at: item.paid_at,
                transaction_id: item.transaction_id,
              };
            });
            setItemPaymentStatus(statusMap);
          } else {
            throw new Error("Invalid item payment status response");
          }
        } catch (err) {
          console.log("Error fetching payment status:", err);
          setItemPaymentStatus({});
          setItemStatusError(
            err.response?.body?.message ||
              err.response?.body?.error ||
              "Item payment statuses could not be loaded.",
          );
        } finally {
          setItemStatusLoading(false);
        }
      };

      const fetchBalance = () => {
        const data = { email: userEmail };
        request
          .post(baseUrl + "user/get_std_wallet_balance/")
          .type("application/json")
          .send(data)
          .then((response) => {
            setUserBalance(response.body.balance);
          })
          .catch((err) => {
            // let errorText = err.response.text;
            // console.log("Error message:", err.response);
          });
      };

      fetchFeesList();
      fetchBalance();
      fetchItemPaymentStatus();
    }
  }, []);

  useEffect(() => {
    // Set the viewport width to 1024 when the component mounts
    const metaTag = document.querySelector('meta[name="viewport"]');
    metaTag.setAttribute("content", "width=1024");

    // Clean up the effect when the component unmounts
    return () => {
      // Restore the original viewport settings
      metaTag.setAttribute("content", "width=device-width, initial-scale=1");
    };
  }, []);

  return (
    <MDBContainer className="py-4">
      <div className="mb-3">
        <MDBBtn color="secondary" size="sm" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left me-2"></i>Back
        </MDBBtn>
      </div>
      <div className="border p-4 bg-white position-relative shadow-sm rounded">
        {/* Status Badge */}
        <MDBRow>
          <MDBCol className="w-100 d-flex justify-content-end">
            <MDBBadge
              color={
                String(invoiceData?.status || "").toLowerCase() === "paid"
                  ? "success"
                  : "danger"
              }
              pill
              className="absolute top-0 end-0 w-25 mb-3 p-2"
            >
              {invoiceData?.status}
            </MDBBadge>
          </MDBCol>
        </MDBRow>
        <div className="d-flex justify-content-between mb-4">
          <div>
            <h4 style={{ color: "green", textAlign: "left" }}>
              <i className="fas fa-file-invoice"></i>
              {invoiceData?.invoice_code}
            </h4>
            <p style={{ textAlign: "left" }}>
              Created:{" "}
              <span style={{ color: "blue" }}>{invoiceData?.invoice_date}</span>
              <br />
              Due: <span style={{ color: "red" }}>{invoiceData?.due_date}</span>
            </p>
          </div>
          <div className="text-end">
            <strong>MCCHST Funtua</strong>
            <br />
            mcchstfuntua.edu.ng
            <br />
            info@mcchstfuntua.edu.ng
          </div>
        </div>
        {/* Info Section */}
        <div
          style={{ textAlign: "left" }}
          className="d-flex justify-content-between mb-4"
        >
          <div>
            <strong>Billed To:</strong>
            <br />
            {invoiceData?.target_id}
            <br />
          </div>
          <div className="text-end">
            <strong>Payment Method:</strong>
            <br />
            Online Payment
          </div>
        </div>

        {itemStatusError && (
          <div className="alert alert-danger" role="alert">
            {itemStatusError} The page will not assume unpaid status while this
            information is unavailable.
          </div>
        )}

        <MDBTable hover>
          <MDBTableHead light>
            <tr className="fw-bold">
              <th style={{ textAlign: "left" }}>Description</th>
              <th style={{ textAlign: "left" }}>Amount</th>
              <th style={{ textAlign: "left" }}>Status</th>
            </tr>
          </MDBTableHead>

          <MDBTableBody>
            {invoiceItems.map((item, idx) => {
              const status = itemPaymentStatus[item.id];
              const statusLabel = itemStatusLoading
                ? "Loading..."
                : itemStatusError
                  ? "Status unavailable"
                  : status?.status || "Pending";
              const statusColor =
                statusLabel === "Paid"
                  ? "success"
                  : statusLabel === "Partially Paid"
                    ? "info"
                    : statusLabel === "Reconciliation Required" ||
                        statusLabel === "Status unavailable"
                      ? "danger"
                      : "warning";
              return (
                <tr key={idx}>
                  <td>{item.description}</td>
                  <td>{formatCurrency(parseFloat(item.amount) || 0)}</td>
                  <td>
                    <MDBBadge color={statusColor} pill>
                      {statusLabel === "Paid" ? (
                        <>
                          <i className="fas fa-check-circle me-1"></i>
                          Paid
                        </>
                      ) : (
                        <>
                          <i className="fas fa-clock me-1"></i>
                          {statusLabel}
                        </>
                      )}
                    </MDBBadge>
                  </td>
                </tr>
              );
            })}
            <tr className="fw-bold">
              <td className="text-end">Total:</td>
              <td>{formatCurrency(parseFloat(total) || 0)}</td>
              <td></td>
            </tr>
            {waiverAmount > 0 && (
              <tr>
                <td className="text-end">Waiver:</td>
                <td className="text-success">
                  - {formatCurrency(waiverAmount)}
                </td>
                <td></td>
              </tr>
            )}
            {waiverAmount > 0 && (
              <tr className="fw-bold">
                <td className="text-end">Amount After Waiver:</td>
                <td>{formatCurrency(netTotal)}</td>
                <td></td>
              </tr>
            )}
          </MDBTableBody>
        </MDBTable>
        {/* Buttons */}
        <div className="text-center mt-4">
          {invoiceData?.status === "Paid" && (
            <MDBBtn
              color="primary"
              onClick={() => {
                const data = { pay_code: payCode, mode: "invoice" };
                fetchFile(
                  "https://api.mcchstfuntua.edu.ng/data/receipt/index.php",
                  data,
                  "Printing",
                  "Please wait...",
                  "receipt.pdf",
                );
              }}
              className="me-2"
            >
              Print Receipt
            </MDBBtn>
          )}

          {invoiceData?.status !== "Paid" && (
            <>
              {/* <button onClick={handlePayByWallet} className="btn btn-primary">
                Pay Now
              </button> */}

              <button
                onClick={() => {
                  const data = { pay_code: payCode };
                  fetchFile(
                    "https://api.mcchstfuntua.edu.ng/data/invoice/index.php",
                    data,
                    "Printing",
                    "Please wait...",
                    "invoice.pdf",
                  );
                }}
                className="btn btn-info mx-2"
              >
                Print Invoice
              </button>
            </>
          )}
        </div>
      </div>
    </MDBContainer>
  );
};

export default SchInvoicePage;
