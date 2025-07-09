import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import request from "superagent";
import Swal from "sweetalert2";
import logo from "../../../pictures/logo.png";
import "./style.css";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import { Toast } from "../../errorNotifier";
import { loader } from "../../LoadingSpinner";
import { paystackPublicKey, paystackTestKey } from "../../../services/setup";

export const AcceptanceComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [applicationFees, setApplicationFees] = useState(0);
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [paymentRef, setPaymentRef] = useState("");

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

  useEffect(() => {
    if (location.state?.userData) {
      const { Email, PhoneNumber } = location.state.userData;
      setUserEmail(Email);
      setUserPhoneNumber(PhoneNumber);
      handleFetchData(PhoneNumber);
    } else {
      navigate("/login");
    }
  }, [location.state, navigate]);

  const handleFetchData = async (phoneNumber) => {
    try {
      const response = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/application.php"
      );
      const basicDetails = response.body.details;
      setApplicationFees(basicDetails.AcceptanceFee);
      // console.log("USER PHONE: ", phoneNumber);
      setPaymentRef("ACF_" + phoneNumber);
    } catch (err) {
      // console.log("Error fetching data:", err);
    }
  };

  const initializePayment = () => {
    if (!window.PaystackPop) {
      return Swal.fire(
        "Error",
        "Payment service not loaded. Please refresh the page.",
        "error"
      );
    }

    // console.log("PAY REF", paymentRef);

    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: userEmail,
      amount: 100 * applicationFees,
      currency: "NGN",
      reference: paymentRef,
      onClose: () => {
        alert(
          "Wait! Don't leave, if you have already started the payment process."
        );
      },
      callback: handlePaymentCallback,
    });

    handler.openIframe();
  };

  const handlePaymentCallback = (response) => {
    processPayment(response.reference);
  };

  const processPayment = async (transactionReference) => {
    loader({
      title: "Saving your payment",
      text: "Please wait while we save your payment.",
    });

    try {
      await request
        .post("https://api.mcchstfuntua.edu.ng/pay.php")
        .type("application/json")
        .send({
          Mode: "acceptance",
          Email: userEmail,
          TransactionReference: transactionReference,
        });

      Toast.fire({
        title: "Success!",
        text: "Payment saved successfully",
        icon: "success",
      });

      navigate("/login", {
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

        <div className="form-caption">ACCEPTANCE FEE PAYMENT</div>

        <div className="text-container">
          By clicking on the Pay Now button below, you agree to pay the sum of
          <span className="mx-2" style={{ fontWeight: 900, color: "yellow" }}>
            ₦{applicationFees}
          </span>
          . Proceed by clicking on the button and follow the onscreen guide to
          successfully make the payment.
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
                  onClick={() =>
                    navigate("/acceptance-auth", {
                      state: { userEmail: userEmail },
                    })
                  }
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
