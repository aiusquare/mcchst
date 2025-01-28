import { useEffect, useState } from "react";
import { PaystackButton } from "react-paystack";
import { useLocation, useNavigate } from "react-router-dom";
import request from "superagent";
import Swal from "sweetalert2";
import logo from "../../pictures/logo.png";
import "./style.css";
import { MDBBtn, MDBCol, MDBRow } from "mdb-react-ui-kit";

export const PayNow = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [applicationFees, setApplicationFees] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  const componentProps = {
    email: userEmail,
    amount: 100 * applicationFees,
    publicKey: "pk_live_93b81fa393853fd3d23c501294bff2f48e4cce93",
    text: "Pay Now",
    onSuccess: () =>
      Swal.fire({
        title: "Success!",
        text: "We have successfully accepted your payment, you can now proceed with your application",
        icon: "success",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/registration", {
            state: { userData: location.state.userData },
          });
        }
      }),
    onClose: () => alert("Wait! Don't leave :("),
  };

  const handleFetchData = async () => {
    await request
      .get("https://api.mcchstfuntua.edu.ng/admin/application.php")
      .then((response) => {
        const basicDetails = response.body.details;

        setApplicationFees(basicDetails.ApplicationFees);
      })
      .catch((err) => {
        console.log("Error message:", err.response);
        console.log("ERROR", err);
      });
  };

  useEffect(() => {
    if (location.state && location.state.userData) {
      setUserEmail(location.state.userData.Email);
      handleFetchData();
    } else {
      navigate("/login");
    }
  });

  return (
    <div className="index">
      <div className="container">
        <img
          onClick={() => {
            navigate("/");
          }}
          className="LOGO-MCCHST"
          alt="Logo MCCHST"
          src={logo}
        />

        <div className="form-caption">APPLICATION PAYMENT</div>

        <div className="text-container">
          By clicking on paynow button below, you agree to pay the sum of
          <span className="mx-2" style={{ fontWeight: 900, color: "yellow" }}>
            ₦{applicationFees}
          </span>
          for the application form which is
          <span className="mx-2" style={{ fontWeight: 900, color: "yellow" }}>
            NON-REFUNDABLE.
          </span>
          Proceed by clicking on the button and follow the onscreen guide to
          succesfully make the payment.
        </div>

        {applicationFees !== 0 && (
          <div className="button-container">
            <MDBRow>
              <MDBCol>
                <PaystackButton className="button" {...componentProps}>
                  Pay now
                </PaystackButton>
              </MDBCol>
              <MDBCol>
                <div
                  className="button"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate("/auth", {
                      state: { userEmail: userEmail },
                    });
                  }}
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
