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
import usePostFetch from "../../../hooks/usePostFetch";
import usePost from "../../../hooks/usePost";
import { postData } from "../../../utils/post-data";
import { fetchFile } from "../../../utils/fetch-file";

const InvoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = localStorage.getItem("userEmail");
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [payCode, setPayCode] = useState("");

  useEffect(() => {
    if (location.state?.invoiceData) {
      const incData = location.state.invoiceData;

      setInvoiceData(incData);
      setPayCode(incData.pay_id);

      const invoiceData = {
        invoiceId: incData.invoice_code,
      };

      const fetchInvoiceItems = () => {
        request
          .post(baseUrl + "invoices/get_invoice_items_by_id/")
          .type("application/json")
          .send(invoiceData)
          .then((response) => {
            const total = response.body.reduce(
              (sum, item) => sum + (parseFloat(item.amount) || 0),
              0
            );

            setTotal(total);
            setInvoiceItems(response.body);
          })
          .catch((err) => {
            // let errorText = err.response.text;
            // console.log("Error message:", err.response);
          });
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

      fetchInvoiceItems();
      fetchBalance();
    }
  }, []);

  const handlePayByWallet = async () => {
    if (userBalance < total) {
      Swal.fire(
        "Insufficient Balance",
        "You have an insufficient balance, please fund your wallet and continue",
        "warning"
      ).then(() => {
        navigate("/portal/manage-payments");
      });
      return;
    }

    loader({
      title: "Processing",
      text: "Please wait while we process your invoice.",
    });

    try {
      await request
        .post(baseUrl + "invoices/clear_invoice_by_wallet/")
        .type("application/json")
        .send({
          email: userEmail,
          pay_id: invoiceData.pay_id,
          title: invoiceData.title,
        });

      Toast.fire({
        title: "Success!",
        text: "Invoice paid successfully",
        icon: "success",
      });

      // Option 1: Redirect to invoice history or confirmation page
      navigate("/portal/invoices");

      // Option 2 (alternative): trigger data refresh if staying on same page
      // fetchInvoiceItems();  // Call your fetching logic again if needed
    } catch (err) {
      Swal.fire({
        title: "Payment Failed!",
        text: err?.message || "An unexpected error occurred",
        icon: "error",
      });
    }
  };

  return (
    <MDBContainer className="py-4">
      <div className="border p-4 bg-white position-relative shadow-sm rounded">
        {/* Status Badge */}
        <MDBRow>
          <MDBCol className="w-100 d-flex justify-content-end">
            <MDBBadge
              color={invoiceData?.status === "PAID" ? "success" : "danger"}
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
              <span style={{ color: "blue" }}>{invoiceData?.invoice_date}</span>{" "}
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
            </tr>
          </MDBTableHead>

          <MDBTableBody>
            {invoiceItems.map((item, idx) => (
              <tr key={idx}>
                <td>{item.description}</td>
                <td>₦{(parseFloat(item.amount) || 0).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="fw-bold">
              <td className="text-end">Total:</td>
              <td>₦{(parseFloat(total) || 0).toFixed(2)}</td>
            </tr>
          </MDBTableBody>
        </MDBTable>
        {/* Buttons */}
        <div className="text-center mt-4">
          {invoiceData?.status === "Paid" && (
            <MDBBtn
              color="primary"
              onClick={() => {
                const data = { pay_code: payCode };
                fetchFile(
                  "https://api.mcchstfuntua.edu.ng/data/receipt/index.php",
                  data,
                  "Printing",
                  "Please wait...",
                  "receipt.pdf"
                );
              }}
              className="me-2"
            >
              Print Receipt
            </MDBBtn>
          )}

          {invoiceData?.status !== "Paid" && (
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
                    "invoice.pdf"
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

export default InvoicePage;
