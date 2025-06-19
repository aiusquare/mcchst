import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import request from "superagent";
import Swal from "sweetalert2";
import logo from "../../pictures/logo.png";
import "./style.css";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import { Toast } from "../errorNotifier";
import { loader } from "../LoadingSpinner";

export const PayNow = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [applicationFees, setApplicationFees] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [userPhoneNumber, setUserPhoneNumber] = useState("");

  // Load Paystack inline script if not already present
  useEffect(() => {
    if (!document.getElementById("paystack-script")) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.id = "paystack-script";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (location.state && location.state.userData) {
      setUserEmail(location.state.userData.Email);
      setUserPhoneNumber(location.state.userData.PhoneNumber);
      fetchApplicationFees();
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  const fetchApplicationFees = async () => {
    try {
      const response = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/application.php"
      );
      setApplicationFees(response.body.details.ApplicationFees);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: "Failed to fetch application fee. Try again later.",
      });
    }
  };

  const initializePayment = () => {
    const reference = "APP_" + userPhoneNumber;

    // Configure Paystack options
    const handler = window.PaystackPop.setup({
      key: "pk_live_93b81fa393853fd3d23c501294bff2f48e4cce93",
      email: userEmail,
      amount: 100 * applicationFees, // Amount in kobo
      currency: "NGN",
      ref: reference,
      onClose: function () {
        alert(
          "Wait! Don't leave, if you have already started the payment process already."
        );
      },
      callback: handlePaymentCallback, // Pass the function reference, not its result
    });

    // Open the Paystack payment modal
    handler.openIframe();
  };

  const handlePaymentCallback = (response) => {
    // Call an async helper function to process the response
    processPayment(response);
  };

  const processPayment = async (response) => {
    const transactionReference = response.reference;

    loader({
      title: "Saving your payment",
      text: "Please wait while we save your payment.",
    });

    try {
      await request
        .post("https://api.mcchstfuntua.edu.ng/pay.php")
        .type("application/json")
        .send({
          Mode: "application",
          Email: userEmail,
          TransactionReference: transactionReference,
        });
      Toast.fire({
        title: "Success!",
        text: "Payment saved successfully",
        icon: "success",
      });
      navigate("/registration", {
        state: { userData: location.state.userData },
      });
    } catch (err) {
      Swal.fire({
        title: "Payment Failed!",
        text: "Something went wrong while saving your payment. Try again.",
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Retry",
      }).then((result) => {
        if (result.isConfirmed) {
          // Retry by reinitializing payment, if desired
          initializePayment();
        }
      });
    }
  };

  return (
    <div className="index">
      <div className="container">
        <img
          onClick={() => navigate("/")}
          className="LOGO-MCCHST"
          alt="Logo MCCHST"
          src={logo}
        />
        <div className="form-caption">APPLICATION PAYMENT</div>
        <div className="text-container">
          By clicking on pay now below, you agree to pay{" "}
          <span className="mx-2" style={{ fontWeight: 900, color: "yellow" }}>
            ₦{applicationFees}
          </span>
          for the application form, which is{" "}
          <span className="mx-2" style={{ fontWeight: 900, color: "yellow" }}>
            NON-REFUNDABLE
          </span>
          . Follow the on-screen guide to complete the payment.
          <br />
          <br />
          <span className="mx-2" style={{ fontWeight: 900, color: "yellow" }}>
            IMPORTANT: DO NOT CLOSE THE PAYMENT WINDOW until your e-payment
            transaction is COMPLETE.
          </span>
        </div>
        {applicationFees !== 0 && (
          <div className="button-container">
            <MDBRow>
              <MDBCol>
                <button className="button" onClick={initializePayment}>
                  Pay Now
                </button>
              </MDBCol>
              <MDBCol>
                <div
                  className="button"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/auth", { state: { userEmail } })}
                >
                  I have an auth code
                </div>
              </MDBCol>
            </MDBRow>
          </div>
        )}
      </div>
    </div>
  );
};
