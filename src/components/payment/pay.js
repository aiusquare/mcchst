import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import request from "superagent";
import Swal from "sweetalert2";
import logo from "../../pictures/logo.png";
import "./style.css";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import { Toast } from "../errorNotifier";
import { loader } from "../LoadingSpinner";
import { usePaystack } from "../../hooks/usePaystack";
import { baseUrl, getPaystackPublicKey } from "../../services/setup";

const JAMB_ACCESS_FEE_KOBO = 50000;
const JAMB_ACCESS_FEE_NAIRA = JAMB_ACCESS_FEE_KOBO / 100;

export const PayNow = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [applicationFees, setApplicationFees] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [showJambWaiver, setShowJambWaiver] = useState(false);
  const [payJambVerificationFeeOnly, setPayJambVerificationFeeOnly] =
    useState(false);
  const [jambFeeLoading, setJambFeeLoading] = useState(false);
  const [waiverJambNumber, setWaiverJambNumber] = useState("");
  const [waiverJambScore, setWaiverJambScore] = useState("");

  const { ready: paystackReady, openPaystack } = usePaystack();

  useEffect(() => {
    if (location.state && location.state.userData) {
      setUserEmail(location.state.userData.Email);
      setUserPhoneNumber(location.state.userData.PhoneNumber);
      setPayJambVerificationFeeOnly(
        Boolean(location.state.payJambVerificationFeeOnly),
      );
      if (location.state.payJambVerificationFeeOnly) {
        setShowJambWaiver(true);
      }
      fetchApplicationFees();
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  const fetchApplicationFees = async () => {
    try {
      const response = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/application.php",
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
    if (!paystackReady) {
      Toast.fire({
        icon: "warning",
        title:
          "Payment service is still loading. Please try again in a moment.",
      });
      return;
    }

    if (!userEmail || !userPhoneNumber) {
      Toast.fire({
        icon: "error",
        title: "Missing payment details. Please sign in again and retry.",
      });
      return;
    }

    const amountKobo = Number(applicationFees) * 100;
    if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
      Toast.fire({
        icon: "warning",
        title: "Application fee is not ready yet. Please try again shortly.",
      });
      return;
    }

    const reference = `APP_${userPhoneNumber}_${Date.now()}`;
    const activePaystackKey = getPaystackPublicKey();
    const result = openPaystack({
      key: activePaystackKey,
      email: userEmail,
      amount: amountKobo,
      currency: "NGN",
      ref: reference,
      callback: handlePaymentCallback,
      onClose: () =>
        alert(
          "Wait! Don't leave, if you have already started the payment process already.",
        ),
    });

    if (!result.opened) {
      const reasonText =
        result.reason === "live_key_on_localhost"
          ? "Live key cannot run on localhost. Use test key or run via an HTTPS domain."
          : result.message || result.reason || "unknown error";
      Toast.fire({
        icon: "error",
        title: `Could not open payment window (${reasonText}).`,
      });
    }
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
      navigate("/registration/nin-verification", {
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

  const handleJambWaiver = async () => {
    const jambNumberTrimmed = waiverJambNumber.trim().toUpperCase();
    const jambScoreTrimmed = waiverJambScore.trim();

    if (!jambNumberTrimmed) {
      Toast.fire({
        icon: "error",
        title: "Please enter your JAMB registration number.",
      });
      return;
    }

    const scoreNum = Number(jambScoreTrimmed);
    if (
      !jambScoreTrimmed ||
      isNaN(scoreNum) ||
      scoreNum < 0 ||
      scoreNum > 400
    ) {
      Toast.fire({
        icon: "error",
        title: "Please enter a valid JAMB score (0–400).",
      });
      return;
    }

    loader({ title: "Processing JAMB Waiver", text: "Please wait..." });

    try {
      await request
        .post("https://api.mcchstfuntua.edu.ng/jamb_waiver.php")
        .type("application/json")
        .send({
          Email: userEmail,
          JambNumber: jambNumberTrimmed,
          JambScore: jambScoreTrimmed,
        });

      Swal.fire({
        title: "Waiver Applied",
        text: "Your JAMB details are saved. Please pay NGN 500 to access NIN verification.",
        icon: "success",
      }).then(() => {
        initializeJambVerificationFeePayment({
          jambData: {
            jambNumber: jambNumberTrimmed,
            jambScore: jambScoreTrimmed,
          },
        });
      });
    } catch (err) {
      Swal.fire({
        title: "Waiver Failed",
        text: "Unable to process JAMB waiver. Please check your details and try again, or proceed with payment.",
        icon: "error",
      });
    }
  };

  const initializeJambVerificationFeePayment = ({ jambData = null } = {}) => {
    if (!paystackReady) {
      Toast.fire({
        icon: "warning",
        title:
          "Payment service is still loading. Please try again in a moment.",
      });
      return;
    }

    if (!userEmail) {
      Toast.fire({
        icon: "error",
        title: "Missing payment details. Please sign in again and retry.",
      });
      return;
    }

    const safeEmail = userEmail.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
    const reference = `JAMBV_${safeEmail}_${Date.now()}`;
    const activePaystackKey = getPaystackPublicKey();

    setJambFeeLoading(true);

    const result = openPaystack({
      key: activePaystackKey,
      email: userEmail,
      amount: JAMB_ACCESS_FEE_KOBO,
      currency: "NGN",
      ref: reference,
      metadata: {
        mode: "jamb_verification_access",
        purpose: "jamb_verification_access",
        email: userEmail,
      },
      callback: async (resp) => {
        const transactionReference = resp?.reference || reference;

        try {
          const confirmRes = await request
            .post(`${baseUrl}nin_verification/confirm_jamb_access_payment`)
            .type("application/json")
            .send({
              email: userEmail,
              reference: transactionReference,
            });

          if (!confirmRes.body?.status) {
            Toast.fire({
              icon: "error",
              title:
                confirmRes.body?.message ||
                "Payment was received but access could not be granted.",
            });
            return;
          }

          Toast.fire({
            title: "Success!",
            text: "JAMB verification access fee payment saved successfully",
            icon: "success",
          });

          navigate("/registration/nin-verification", {
            state: {
              userData: location.state.userData,
              jambData: jambData || location.state?.jambData,
            },
          });
        } catch (confirmErr) {
          Toast.fire({
            icon: "error",
            title:
              confirmErr?.response?.body?.message ||
              "Payment confirmation failed. Please contact support with your payment reference.",
          });
        } finally {
          setJambFeeLoading(false);
        }
      },
      onClose: () => {
        setJambFeeLoading(false);
      },
    });

    if (!result.opened) {
      setJambFeeLoading(false);
      const reasonText =
        result.reason === "live_key_on_localhost"
          ? "Live key cannot run on localhost. Use test key or run via an HTTPS domain."
          : result.message || result.reason || "unknown error";
      Toast.fire({
        icon: "error",
        title: `Could not open payment window (${reasonText}).`,
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

        {!showJambWaiver ? (
          <>
            <div className="form-caption">APPLICATION PAYMENT</div>
            <div className="text-container">
              By clicking on pay now below, you agree to pay{" "}
              <span
                className="mx-2"
                style={{ fontWeight: 900, color: "yellow" }}
              >
                ₦{applicationFees}
              </span>
              for the application form, which is{" "}
              <span
                className="mx-2"
                style={{ fontWeight: 900, color: "yellow" }}
              >
                NON-REFUNDABLE
              </span>
              . Follow the on-screen guide to complete the payment.
              <br />
              <br />
              <span
                className="mx-2"
                style={{ fontWeight: 900, color: "yellow" }}
              >
                IMPORTANT: DO NOT CLOSE THE PAYMENT WINDOW until your e-payment
                transaction is COMPLETE.
              </span>
              <br />
              <br />
              <span style={{ color: "#90ee90", fontWeight: 600 }}>
                Have a JAMB result? You may be eligible for a fee waiver — click
                &quot;I have JAMB (fee waiver)&quot; below.
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
                      onClick={() =>
                        navigate("/auth", { state: { userEmail } })
                      }
                    >
                      I have an auth code
                    </div>
                  </MDBCol>
                  <MDBCol>
                    <div
                      className="button"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowJambWaiver(true)}
                    >
                      I have JAMB (fee waiver)
                    </div>
                  </MDBCol>
                </MDBRow>
              </div>
            )}
          </>
        ) : payJambVerificationFeeOnly ? (
          <>
            <div className="form-caption">JAMB VERIFICATION ACCESS</div>
            <div className="text-container">
              Your JAMB waiver is already on file. Pay
              <span
                className="mx-2"
                style={{ fontWeight: 900, color: "yellow" }}
              >
                NGN {JAMB_ACCESS_FEE_NAIRA}
              </span>
              to access the NIN verification form.
            </div>
            <div className="button-container">
              <MDBRow>
                <MDBCol>
                  <button
                    className="button"
                    onClick={() => initializeJambVerificationFeePayment({})}
                    disabled={jambFeeLoading}
                  >
                    {jambFeeLoading
                      ? "Opening payment..."
                      : `Pay NGN ${JAMB_ACCESS_FEE_NAIRA}`}
                  </button>
                </MDBCol>
                <MDBCol>
                  <div
                    className="button"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowJambWaiver(false)}
                  >
                    Back
                  </div>
                </MDBCol>
              </MDBRow>
            </div>
          </>
        ) : (
          <>
            <div className="form-caption">JAMB FEE WAIVER</div>
            <div className="text-container">
              Enter your JAMB registration number and score below. Your
              application fee will be waived, then you will pay
              <span
                className="mx-2"
                style={{ fontWeight: 900, color: "yellow" }}
              >
                NGN {JAMB_ACCESS_FEE_NAIRA}
              </span>
              before accessing NIN verification.
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                padding: "0 20px 20px",
              }}
            >
              <input
                placeholder="JAMB Registration Number (e.g. 12345678AB)"
                value={waiverJambNumber}
                onChange={(e) => setWaiverJambNumber(e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "25px",
                  border: "none",
                  width: "100%",
                  maxWidth: "320px",
                  fontSize: "14px",
                  outline: "none",
                  textTransform: "uppercase",
                }}
              />
              <input
                placeholder="JAMB Score (0 – 400)"
                value={waiverJambScore}
                onChange={(e) => setWaiverJambScore(e.target.value)}
                type="number"
                min="0"
                max="400"
                style={{
                  padding: "12px 16px",
                  borderRadius: "25px",
                  border: "none",
                  width: "100%",
                  maxWidth: "320px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
            <div className="button-container">
              <MDBRow>
                <MDBCol>
                  <button
                    className="button"
                    onClick={handleJambWaiver}
                    disabled={jambFeeLoading}
                  >
                    {jambFeeLoading
                      ? "Opening payment..."
                      : "Proceed with Waiver"}
                  </button>
                </MDBCol>
                <MDBCol>
                  <div
                    className="button"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowJambWaiver(false)}
                  >
                    Back
                  </div>
                </MDBCol>
              </MDBRow>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
