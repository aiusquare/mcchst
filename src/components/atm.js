import React, { useEffect, useRef, useState } from "react";
import {
  MDBCard,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBContainer,
} from "mdb-react-ui-kit";
import { Alert, Snackbar, TextField } from "@mui/material";
import { PaystackButton } from "react-paystack";
import logo from "../pictures/logo.png";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

const Atm = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [walletFundingAmount, setWalletFundingAmount] = useState(5000);
  const [inCorrectAmount, setIncorrectAmount] = useState(false);

  useEffect(() => {
    if (!location.state || !location.state.userData) {
      navigate("/login");
    } else {
      setUserEmail(location.state.userData.Email);
    }
  }, [location, navigate]);

  const handlePaymentSuccess = () => {
    Swal.fire({
      title: "Success!",
      text: "We have successfully accepted your payment, you can now proceed with your application",
      icon: "success",
    }).then((result) => {
      if (result.isConfirmed) {
        // navigate("/registration", {
        //   state: { userData: location.state.userData },
        // });
      }
    });
  };

  const handlePaymentClose = () => {
    alert("Wait! Don't leave :(");
  };

  const handlePaymentClick = () => {
    const amount = parseFloat(walletFundingAmount);
    if (isNaN(amount) || amount < 100) {
      setIncorrectAmount(true);
    }
  };

  const componentProps = {
    email: userEmail,
    amount: 100 * walletFundingAmount,
    publicKey: "pk_live_93b81fa393853fd3d23c501294bff2f48e4cce93",
    text: "Pay Now",
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentClose,
  };

  return (
    <div>
      <MDBContainer className="d-flex flex-column align-items-center p-2">
        <MDBRow>
          <MDBCol>
            <MDBCard
              className="m-4 p-2"
              style={{ cursor: "pointer", width: "150px", height: "150px" }}
            >
              <MDBCardImage position="top" src={logo}></MDBCardImage>
            </MDBCard>
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol>
            <div>
              <h4 style={{ textAlign: "center" }}>AUTOMATIC PAYMENT</h4>
              <div className="mx-4" style={{ textAlign: "center" }}>
                Note: you must pay the exact inputed amount before the payment
                will be acknowleged
              </div>
              <Snackbar
                open={inCorrectAmount}
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
                autoHideDuration={6000}
                onClose={() => {
                  setIncorrectAmount(false);
                }}
              >
                <Alert severity="error">Amount must be N100 or above</Alert>
              </Snackbar>

              <MDBCard>
                <TextField
                  className="m-2"
                  onChange={(e) => setWalletFundingAmount(e.target.value)}
                  value={walletFundingAmount}
                  type="number"
                  InputProps={{
                    inputProps: {
                      min: 100,
                      style: { textAlign: "center" },
                    },
                  }}
                />
              </MDBCard>
              <div className="d-flex align-items-center justify-content-center">
                <PaystackButton
                  className="m-2 p-2 w-50 button paystack-btn-green"
                  {...componentProps}
                  onClick={handlePaymentClick}
                />
                <div
                  className="m-2 p-2 w-50 button paystack-btn-green"
                  onClick={() => {
                    setIncorrectAmount(false);
                  }}
                >
                  Cancel
                </div>
              </div>
            </div>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
};

export default Atm;
