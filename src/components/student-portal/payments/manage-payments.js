import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import request from "superagent";
import { loader } from "../../LoadingSpinner";
import { Toast } from "../../errorNotifier";
import Swal from "sweetalert2";
import { baseUrl } from "../../../services/setup";
import usePostFetch from "../../../hooks/usePostFetch";

const StudentPaymentsDashboard = () => {
  const navigate = useNavigate();

  const postData = { userId: localStorage.getItem("userEmail") };
  const { data: virtualAccounts } = usePostFetch(
    baseUrl + "paystack/get_wallets",
    postData,
    null,
    null
  );

  console.log("THE RETURNED WALLET: ", virtualAccounts);

  const [showModal, setShowModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [outstanding, setOutstanding] = useState(0);
  const [wallet, setWallet] = useState(0);

  const netBalance = wallet - outstanding;
  const userEmail = localStorage.getItem("userEmail");

  const handleFetchData = async () => {
    const invoiceData = {
      email: userEmail,
    };

    request
      .post(baseUrl + "invoices/get_invoices_by_email/")
      .type("application/json")
      .send(invoiceData)
      .then((response) => {
        const total = response.body.reduce((sum, item) => {
          if (item.status === "Unpaid") {
            return sum + (parseFloat(item.amount) || 0);
          }
          return sum;
        }, 0);

        setOutstanding(total);
      })
      .catch((err) => {
        // let errorText = err.response.text;
        // console.log("Error message:", err.response);
      });

    request
      .post(baseUrl + "user/get_std_wallet_balance/")
      .type("application/json")
      .send(invoiceData)
      .then((response) => {
        // console.log("Wallet response:", response.body);
        setWallet(parseFloat(response.body.balance) || 0);
      })
      .catch((err) => {
        // let errorText = err.response.text;
        // console.log("Error message:", err.response);
      });
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  useEffect(() => {
    // Inject Paystack script if not already present
    if (!document.getElementById("paystack-script")) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.id = "paystack-script";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const initializePayment = async () => {
    if (!window.PaystackPop) {
      return Swal.fire(
        "Error",
        "Payment service not loaded. Please refresh the page.",
        "error"
      );
    }

    if (!fundAmount || isNaN(fundAmount) || fundAmount <= 0) {
      return Swal.fire(
        "Invalid Amount",
        "Please enter a valid funding amount.",
        "warning"
      );
    }

    Swal.fire({
      title: "Please wait",
      text: "Generating invoice...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const data = { userEmail: userEmail, amount: fundAmount };

      const response = await request
        .post(baseUrl + "invoices/generate_wallet_funding_invoice/")
        .type("application/json")
        .send(data)
        .set("Accept", "application/json");

      Swal.close();

      if (!response.body || !response.body.pay_id) {
        return Swal.fire(
          "Error",
          "Invalid invoice response received.",
          "error"
        );
      }

      let paymentRef = response.body.pay_id;
      // localStorage.setItem("paymentRef", paymentRef);

      const payData = {
        key: "pk_live_93b81fa393853fd3d23c501294bff2f48e4cce93",
        email: userEmail,
        amount: parseInt(fundAmount * 100, 10),
        currency: "NGN",
        reference: paymentRef,
        onClose: () => {
          alert(
            "Wait! Don't leave, if you have already started the payment process."
          );
        },
        callback: (response) => {
          processPayment(response.reference, userEmail);
        },
      };

      // console.log("Pay data", payData);

      const handler = window.PaystackPop.setup(payData);

      handler.openIframe();
    } catch (err) {
      Swal.close();
      // console.error("Error generating invoice:", err);
      Swal.fire(
        "Invoice Generation Failed",
        err?.response?.body?.message || "Something went wrong.",
        "error"
      );
    }
  };

  const processPayment = async (transactionReference, userEmail) => {
    loader({
      title: "Saving your payment",
      text: "Please wait while we save your payment.",
    });

    try {
      await request
        .post(baseUrl + "billing/verify_wallet_funding/")
        .type("application/json")
        .send({
          userEmail: userEmail,
          TransactionReference: transactionReference,
        });

      setShowModal(false);

      Toast.fire({
        title: "Success!",
        text: "Payment saved successfully",
        icon: "success",
      });
      window.location.reload(true);
    } catch (err) {
      Swal.fire({
        title: "Payment Failed!",
        text: "Something went wrong while saving your payment. Try again.",
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Retry",
      }).then((result) => {
        if (result.isConfirmed) {
          initializePayment();
        }
      });
    }
  };

  // const virtualAccounts = [
  //   {
  //     bankName: "MoniePoint MFB",
  //     accountNumber: "1234XXXXXXX",
  //     accountName: "mcchct funtua",
  //   },
  //   {
  //     bankName: "Wema Bank",
  //     accountNumber: "9876XXXXXXX",
  //     accountName: "mcchst funtua",
  //   },
  // ];

  const status =
    outstanding === 0
      ? "Cleared"
      : wallet >= outstanding
      ? "Ready to Clear"
      : wallet > 0
      ? "Partially Paid"
      : "Outstanding";

  const statusColor = {
    Cleared: "text-success",
    "Ready to Clear": "text-primary",
    "Partially Paid": "text-warning",
    Outstanding: "text-danger",
  }[status];

  return (
    <div className="container mt-4">
      <h4 className="fw-bold">Hi! {"Dear"}</h4>
      <p className="text-muted mb-4">Track your payments with ease.</p>

      {/* Balance Cards */}
      <div className="row g-3">
        {/* Wallet Balance */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted">Wallet Balance</h6>
              <h4 className="text-success">₦{wallet.toFixed(2)}</h4>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-warning btn-sm mt-2 w-100"
              >
                Fund Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted">Outstanding Balance</h6>
              <h4 className="text-danger">₦{outstanding.toFixed(2)}</h4>
              <button
                onClick={() => navigate("/portal/invoices")}
                className="btn btn-danger btn-sm mt-2 w-100"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>

        {/* Net Balance */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted">Net Balance</h6>
              <h4 className={netBalance < 0 ? "text-danger" : "text-success"}>
                ₦{netBalance.toFixed(2)}
              </h4>
              <button
                style={{ color: "white" }}
                className="btn btn-success btn-sm mt-2 w-100"
                disabled
              >
                Transactions
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted">Payment Status</h6>
              <h4 className={statusColor}>{status}</h4>
              <button className="btn btn-secondary btn-sm mt-2 w-100">
                View History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Virtual Accounts */}
      <div className="mt-5">
        <h5 className="fw-bold mb-3">Your Dedicated Virtual Accounts</h5>
        <div className="row g-3">
          {Array.isArray(virtualAccounts) &&
            virtualAccounts.map((acc, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="card shadow-sm mb-3">
                  <div className="card-body">
                    <h6 className="text-muted">Virtual Account {idx + 1}</h6>

                    <p className="mb-1">
                      <strong>Bank:</strong> {acc.bank_name}
                    </p>
                    <p className="mb-1">
                      <strong>Account Number:</strong> {acc.account_number}
                    </p>
                    <p className="mb-0">
                      <strong>Account Name:</strong> {acc.account_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Fund Wallet</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label htmlFor="amount">Enter Amount</label>
                <input
                  type="number"
                  id="amount"
                  className="form-control"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="₦0.00"
                  min="0"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={initializePayment}
                  disabled={!fundAmount}
                >
                  Proceed to Fund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPaymentsDashboard;
