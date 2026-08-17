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
import { baseUrl } from "../../../services/setup";
import Swal from "sweetalert2";
import { Toast } from "../../errorNotifier";
import { loader } from "../../LoadingSpinner";
import { postData } from "../../../utils/post-data";
import { fetchFile } from "../../../utils/fetch-file";
import { formatCurrency } from "../../../utils/formatCurrency";

const InvoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = localStorage.getItem("userEmail");
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [payCode, setPayCode] = useState("");
  const [itemPaymentStatus, setItemPaymentStatus] = useState({});

  const invoiceStatus = (invoiceData?.status || "").toLowerCase();
  const invoiceMode = (invoiceData?.mode || "").toLowerCase();
  const isPaidInvoice = invoiceStatus === "paid";
  const isPartialInvoice = invoiceStatus === "partial";
  const isCanceledInvoice =
    invoiceStatus === "canceled" || invoiceMode === "canceled";
  const paidItemTotal = Math.max(
    parseFloat(invoiceData?.payment_amount) || 0,
    Object.values(itemPaymentStatus).reduce(
      (sum, status) => sum + (parseFloat(status?.amount_paid) || 0),
      0,
    ),
  );
  const outstandingTotal = Math.max(0, total - paidItemTotal);

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

          setTotal(total - (parseFloat(incData.waiver) || 0));
          setInvoiceItems(invoiceItems);
        }
      };

      // Fetch payment status for each item
      const fetchItemPaymentStatus = async () => {
        try {
          const response = await request
            .post(baseUrl + "invoices/get_invoice_items_with_status/")
            .type("application/json")
            .send({
              invoiceId: incData.invoice_code,
              email: userEmail,
            });

          if (response.body && response.body.data) {
            // Map payment status by item_id for quick lookup
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
          }
        } catch (err) {
          console.log("Error fetching payment status:", err);
          // Silently fail - not critical if status fetch fails
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

  const handlePayByWallet = async () => {
    if (isCanceledInvoice) {
      Swal.fire(
        "Invoice Canceled",
        "This invoice has been canceled and cannot be paid.",
        "warning",
      );
      return;
    }

    // Check wallet balance for this selected invoice only.
    if (outstandingTotal <= 0) {
      Swal.fire("Invoice Paid", "This invoice has no outstanding balance.", "info");
      return;
    }

    if (userBalance <= 0) {
      Swal.fire(
        "Insufficient Balance",
        "Your wallet balance cannot settle any item on this invoice. Please fund your wallet to continue.",
        "warning",
      ).then(() => {
        navigate("/portal/manage-payments");
      });
      return;
    }

    // 4️⃣ Show loader
    loader({
      title: "Processing",
      text: "Please wait while we process your invoice.",
    });

    // 5️⃣ Make payment request
    try {
      const response = await request
        .post(`${baseUrl}invoices/clear_invoice_by_wallet/`)
        .timeout({ response: 10000, deadline: 45000 })
        .type("application/json")
        .send({
          email: userEmail,
          pay_id: invoiceData.pay_id,
          invoice_code: invoiceData.invoice_code,
          title: invoiceData.title,
        });
      const result = response.body || {};
      Swal.close();

      // 6️⃣ Success feedback
      if ((result.items_paid || 0) > 0 || result.fully_paid) {
        Toast.fire({
          title: result.fully_paid ? "Invoice paid" : "Invoice partially paid",
          text: result.message || "Payment processed successfully",
          icon: result.fully_paid ? "success" : "warning",
        });
      } else {
        Swal.fire({
          title: "Payment not applied",
          text:
            result.message ||
            "Wallet balance could not cover the next unpaid item on this invoice.",
          icon: "warning",
        });
        return;
      }

      navigate("/portal/invoices");
    } catch (err) {
      Swal.close();
      const errorBody = err?.response?.body || {};
      // 7️⃣ Error feedback
      Swal.fire({
        title: "Payment Failed!",
        text:
          errorBody.message ||
          errorBody.error ||
          err?.message ||
          "An unexpected error occurred",
        icon: "error",
      });
    }
  };

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
      <div className="border p-4 bg-white position-relative shadow-sm rounded">
        {/* Status Badge */}
        <MDBRow>
          <MDBCol className="w-100 d-flex justify-content-end">
            <MDBBadge
              color={
                isPaidInvoice
                  ? "success"
                  : isCanceledInvoice
                    ? "secondary"
                    : isPartialInvoice
                      ? "warning"
                  : "danger"
              }
              pill
              className="absolute top-0 end-0 w-25 mb-3 p-2"
            >
              {invoiceData?.status}
            </MDBBadge>
          </MDBCol>
        </MDBRow>

        {/* Clearance Status Summary */}
        {(() => {
          const paidItems = Object.values(itemPaymentStatus).filter(
            (s) => s?.status === "Paid",
          ).length;
          const totalItems = invoiceItems.length;
          const pendingItems = totalItems - paidItems;
          const clearancePercentage =
            totalItems > 0 ? Math.round((paidItems / totalItems) * 100) : 0;

          return (
            <MDBRow
              className="mb-4 p-3"
              style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
            >
              <MDBCol md="12">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-2" style={{ color: "#333" }}>
                      <i className="fas fa-tasks me-2"></i>
                      <strong>Clearance Progress</strong>
                    </h6>
                    <p
                      className="mb-0"
                      style={{ fontSize: "0.9rem", color: "#666" }}
                    >
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        <i className="fas fa-check-circle me-1"></i>
                        {paidItems} Paid
                      </span>
                      {" | "}
                      <span style={{ color: "#ff9800", fontWeight: "bold" }}>
                        <i className="fas fa-clock me-1"></i>
                        {pendingItems} Pending
                      </span>
                      {" | "}
                      <span style={{ color: "#2196f3", fontWeight: "bold" }}>
                        {clearancePercentage}% Complete
                      </span>
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `conic-gradient(
                        ${clearancePercentage <= 50 ? "#ff9800" : clearancePercentage === 100 ? "#28a745" : "#2196f3"}
                        0deg ${(clearancePercentage / 100) * 360}deg,
                        #f0f0f0 ${(clearancePercentage / 100) * 360}deg
                      )`,
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      {clearancePercentage}%
                    </div>
                  </div>
                </div>
              </MDBCol>
            </MDBRow>
          );
        })()}

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
              const isPaid = status?.status === "Paid";
              return (
                <tr key={idx}>
                  <td>{item.description}</td>
                  <td>
                    {formatCurrency((parseFloat(item.amount) || 0).toFixed(2))}
                  </td>
                  <td>
                    <MDBBadge color={isPaid ? "success" : "warning"} pill>
                      {isPaid ? (
                        <>
                          <i className="fas fa-check-circle me-1"></i>
                          Paid
                        </>
                      ) : (
                        <>
                          <i className="fas fa-clock me-1"></i>
                          Pending
                        </>
                      )}
                    </MDBBadge>
                  </td>
                </tr>
              );
            })}

            {invoiceData?.waiver && (
              <tr className="fw-bold">
                <td className="text-end" style={{ color: "green" }}>
                  Waiver:
                </td>
                <td style={{ color: "green" }}>
                  -
                  {formatCurrency(
                    (parseFloat(invoiceData.waiver) || 0).toFixed(2),
                  )}
                </td>
              </tr>
            )}

            <tr className="fw-bold">
              <td className="text-end">Total:</td>
              <td>{formatCurrency((parseFloat(total) || 0).toFixed(2))}</td>
            </tr>
            {isPartialInvoice && (
              <tr className="fw-bold">
                <td className="text-end">Outstanding:</td>
                <td>
                  {formatCurrency(
                    (parseFloat(outstandingTotal) || 0).toFixed(2),
                  )}
                </td>
              </tr>
            )}
          </MDBTableBody>
        </MDBTable>

        {/* Buttons */}
        <div className="text-center mt-4">
          {isPaidInvoice && (
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

          {!isPaidInvoice && !isCanceledInvoice && (
            <>
              <button onClick={handlePayByWallet} className="btn btn-primary">
                Pay Now
              </button>

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

          {isCanceledInvoice && (
            <MDBBadge color="secondary" pill className="p-3">
              Invoice Canceled
            </MDBBadge>
          )}
        </div>
      </div>
    </MDBContainer>
  );
};

export default InvoicePage;
