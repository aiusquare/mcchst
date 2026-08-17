import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, TextField } from "@mui/material";
import { MDBCol, MDBContainer, MDBRow } from "mdb-react-ui-kit";
import Swal from "sweetalert2";
import axios from "axios";
import logo from "../../pictures/logo.png";
import "../../css/style.css";
import { Toast } from "../errorNotifier";
import { usePaystack } from "../../hooks/usePaystack";
import { baseUrl, getPaystackPublicKey } from "../../services/setup";

const REATTEMPT_FEE_KOBO = 50000;
const REATTEMPT_FEE_NAIRA = REATTEMPT_FEE_KOBO / 100;

function NinVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [nin, setNin] = useState("");
  const [ninVerified, setNinVerified] = useState(false);
  const [ninLoading, setNinLoading] = useState(false);
  const [reattemptLoading, setReattemptLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [ninAttemptCount, setNinAttemptCount] = useState(0);
  const [ninPhoto, setNinPhoto] = useState(null);
  const [ninData, setNinData] = useState(null);
  const { ready: paystackReady, openPaystack } = usePaystack();

  const normalizePhotoSrc = (photo) => {
    if (!photo) {
      return "";
    }

    return photo.startsWith("data:image/")
      ? photo
      : `data:image/jpeg;base64,${photo}`;
  };

  const formatName = (data) =>
    [data?.firstname, data?.middlename, data?.lastname]
      .filter(Boolean)
      .join(" ");

  const formatResidence = (data) =>
    [
      data?.residence?.address1,
      data?.residence?.lga,
      data?.residence?.state,
    ]
      .filter(Boolean)
      .join(", ");

  useEffect(() => {
    const userData = location.state?.userData;

    if (!userData?.Email) {
      navigate("/login");
      return;
    }

    setEmail(userData.Email);
  }, [location.state, navigate]);

  useEffect(() => {
    const fetchNinStatus = async () => {
      if (!email) {
        return;
      }

      setPageLoading(true);
      try {
        const gateResponse = await axios.get(
          `${baseUrl}nin_verification/get_access_gate/${encodeURIComponent(email)}`,
        );

        if (
          gateResponse.data?.status &&
          gateResponse.data?.requires_payment &&
          !gateResponse.data?.is_paid
        ) {
          Toast.fire({
            icon: "warning",
            title: "JAMB applicants must pay NGN 500 before NIN verification.",
          });
          navigate("/payment", {
            state: {
              userData: location.state?.userData,
              jambData: location.state?.jambData,
              payJambVerificationFeeOnly: true,
            },
          });
          return;
        }

        const response = await axios.get(
          `${baseUrl}nin_verification/get/${encodeURIComponent(email)}`,
        );

        if (
          response.data.status &&
          !response.data.is_pending &&
          response.data.nin_data?.firstname
        ) {
          setNinVerified(true);
          setNin(response.data.nin_data.nin || "");
          setNinPhoto(response.data.nin_data.photo || null);
          setNinData(response.data.nin_data);
          setNinAttemptCount(response.data.attempt_count || 1);
        } else if (response.data.status && response.data.is_pending) {
          setNinVerified(false);
          setNinData(null);
          setNinAttemptCount(response.data.attempt_count || 1);
        }
      } catch (_) {
        // Keep page ready for first-time verification.
      } finally {
        setPageLoading(false);
      }
    };

    fetchNinStatus();
  }, [email, navigate, location.state]);

  const verifyNin = async () => {
    if (!email) {
      Toast.fire({
        icon: "error",
        title: "Your session expired. Please log in again.",
      });
      navigate("/login");
      return;
    }

    if (!nin || nin.length !== 11) {
      Toast.fire({
        icon: "error",
        title: "Please enter a valid 11-digit NIN.",
      });
      return;
    }

    setNinLoading(true);
    try {
      const response = await axios.post(`${baseUrl}nin_verification/verify`, {
        email,
        nin,
      });

      if (!response.data.status) {
        Toast.fire({
          icon: "error",
          title: response.data.message || "Verification failed.",
        });
        return;
      }

      setNinVerified(true);
      setNin(response.data.nin_data?.nin || nin);
      setNinPhoto(response.data.nin_data?.photo || null);
      setNinData(response.data.nin_data || null);
      setNinAttemptCount(response.data.attempt_count || 1);

      Toast.fire({
        icon: "success",
        title: "NIN verified successfully. Continue to the registration form.",
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "NIN verification failed. Please check your NIN and try again.";
      Toast.fire({ icon: "error", title: msg });
    } finally {
      setNinLoading(false);
    }
  };

  const handleReattempt = () => {
    Swal.fire({
      title: "Re-verify NIN?",
      html: `
        <p>If the details shown do not match yours, you may re-enter your NIN.</p>
        <p style="color:#c0392b; font-weight:600;">Each re-verification costs NGN ${REATTEMPT_FEE_NAIRA}.</p>
        ${ninAttemptCount > 0 ? `<p>Previous attempts: <strong>${ninAttemptCount}</strong></p>` : ""}
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c0392b",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Proceed to payment",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      if (!paystackReady) {
        Toast.fire({
          icon: "warning",
          title:
            "Payment service is still loading. Please try again in a moment.",
        });
        return;
      }

      if (!email) {
        Toast.fire({
          icon: "error",
          title: "Your session expired. Please log in again.",
        });
        navigate("/login");
        return;
      }

      const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
      const reference = `NINR_${safeEmail}_${Date.now()}`;
      const paystackKey = getPaystackPublicKey();

      setReattemptLoading(true);

      const resultOpen = openPaystack({
        key: paystackKey,
        email,
        amount: REATTEMPT_FEE_KOBO,
        currency: "NGN",
        ref: reference,
        metadata: {
          mode: "nin_reattempt",
          purpose: "nin_reverification",
          email,
        },
        callback: async (paymentResponse) => {
          const transactionReference = paymentResponse?.reference || reference;

          try {
            const confirmRes = await axios.post(
              `${baseUrl}nin_verification/confirm_reattempt_payment`,
              {
                email,
                reference: transactionReference,
              },
            );

            if (!confirmRes.data?.status) {
              Toast.fire({
                icon: "error",
                title:
                  confirmRes.data?.message ||
                  "Payment was received but re-verification could not be unlocked.",
              });
              return;
            }

            setNinAttemptCount(
              confirmRes.data?.attempt_count || ninAttemptCount + 1,
            );
            setNinVerified(false);
            setNinPhoto(null);
            setNinData(null);
            setNin("");

            Toast.fire({
              icon: "success",
              title: "Payment successful. You can now re-verify your NIN.",
            });
          } catch (confirmErr) {
            Toast.fire({
              icon: "error",
              title:
                confirmErr?.response?.data?.message ||
                "Payment confirmation failed. Please contact support with your payment reference.",
            });
          } finally {
            setReattemptLoading(false);
          }
        },
        onClose: () => {
          setReattemptLoading(false);
        },
      });

      if (!resultOpen.opened) {
        setReattemptLoading(false);
        const reasonText =
          resultOpen.reason === "live_key_on_localhost"
            ? "Live key cannot run on localhost. Use an HTTPS domain."
            : resultOpen.message || resultOpen.reason || "unknown error";
        Toast.fire({
          icon: "error",
          title: `Could not open payment window (${reasonText}).`,
        });
        return;
      }
    });
  };

  const continueToRegistration = () => {
    if (!ninVerified) {
      Toast.fire({
        icon: "warning",
        title: "Please verify your NIN before continuing.",
      });
      return;
    }

    navigate("/registration", {
      state: {
        ...location.state,
      },
    });
  };

  return (
    <div>
      <MDBContainer className="d-flex flex-column align-items-center justify-content-center">
        <img
          className="logo"
          alt="logo"
          src={logo}
          onClick={() => {
            navigate("/");
          }}
        />

        <MDBRow className="mb-4 w-100">
          <MDBCol className="d-flex flex-column align-items-center justify-content-center">
            <Card sx={{ maginLeft: 20, maxWidth: 500 }} className="p-4 w-100">
              <div className="m-4">
                <div
                  style={{
                    fontWeight: "900",
                    fontSize: "32px",
                    color: "#05321e",
                  }}
                >
                  <h1>NIN Verification</h1>
                </div>
              </div>

              <div className="reg-captions">Verify Before Registration</div>

              <div
                style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}
              >
                You must verify your NIN before accessing the main registration
                form.
              </div>

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bolder",
                  color: "#fc0000",
                  marginBottom: "8px",
                }}
              >
                Please ensure you provide your NIN correctly to avoid extra
                charges for re-verification.
              </div>

              {pageLoading ? (
                <div style={{ color: "#555", marginBottom: "8px" }}>
                  Checking verification status...
                </div>
              ) : null}

              <div className="nin-verify-row">
                {ninPhoto && (
                  <img
                    src={normalizePhotoSrc(ninPhoto)}
                    alt="NIN portrait"
                    className="nin-photo"
                  />
                )}

                <div className="nin-input-block" style={{ width: "100%" }}>
                  <div className="nin-input-row">
                    <TextField
                      label="NIN (11 digits)"
                      variant="outlined"
                      margin="normal"
                      value={nin}
                      onChange={(e) =>
                        setNin(e.target.value.replace(/\D/g, "").slice(0, 11))
                      }
                      inputProps={{ maxLength: 11 }}
                      disabled={ninVerified || ninLoading || pageLoading}
                      style={{ flex: 1, minWidth: 0 }}
                      required
                    />
                    <button
                      onClick={verifyNin}
                      disabled={
                        ninVerified ||
                        ninLoading ||
                        pageLoading ||
                        reattemptLoading
                      }
                      className="nin-verify-btn"
                    >
                      {ninLoading
                        ? "Verifying..."
                        : ninVerified
                          ? "Verified"
                          : "Verify NIN"}
                    </button>
                  </div>

                  {ninVerified ? (
                    <div className="nin-verified-label">
                      NIN verified successfully.
                    </div>
                  ) : null}

                  {ninVerified && ninData ? (
                    <div className="nin-identity-card">
                      <div className="nin-identity-title">
                        Confirm applicant details
                      </div>
                      <div className="nin-identity-name">
                        {formatName(ninData) || "Name not available"}
                      </div>
                      <div className="nin-identity-grid">
                        <span>Date of birth</span>
                        <strong>{ninData.birthdate || "Not available"}</strong>
                        <span>Gender</span>
                        <strong>{ninData.gender || "Not available"}</strong>
                        <span>Residence</span>
                        <strong>
                          {formatResidence(ninData) || "Not available"}
                        </strong>
                      </div>
                    </div>
                  ) : null}

                  {ninVerified ? (
                    <div>
                      <button
                        onClick={handleReattempt}
                        disabled={reattemptLoading}
                        className="nin-reattempt-btn"
                      >
                        {reattemptLoading
                          ? "Opening payment..."
                          : "Wrong data? Re-verify NIN"}
                        {ninAttemptCount > 0
                          ? ` (attempt ${ninAttemptCount})`
                          : ""}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <button
                  onClick={continueToRegistration}
                  className="reg-button"
                  style={{ width: "100%", marginTop: "8px" }}
                  disabled={!ninVerified}
                >
                  Continue to Registration Form
                </button>
              </div>
            </Card>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default NinVerification;
