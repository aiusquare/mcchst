import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import {
  MDBCard,
  MDBRow,
  MDBCol,
  MDBContainer,
  MDBBtn,
  MDBCardImage,
} from "mdb-react-ui-kit";
import "../css/style.css";
import { Alert, Collapse, Stack, Snackbar } from "@mui/material";
import { ReactSession } from "react-client-session";
import logo from "../pictures/am_data.png";
import TextInput from "./textField";
import Spinner from "./spinner";

export default function PasswordReset(props) {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const auth = getAuth();
  const [progress, setProgress] = useState(false);
  const [userCorrect, setUserCorrect] = useState(false);
  const [passwordCorrect, setPasswordCorrect] = useState(false);
  const [netConnection, setNetConnection] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [reset, setReset] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  ReactSession.setStoreType("localStorage");

  const query = new URLSearchParams(window.location.search);

  const actionCode = query.get("oobCode");

  console.log("ACTION", actionCode);

  const handleSubmit = () => {
    if (newPassword === "") {
      setUserCorrect(true);
      return;
    }

    if (confirmPassword === "") {
      setPasswordCorrect(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsMatched(true);
    }

    setProgress(true);

    // Verify the password reset code is valid.
    verifyPasswordResetCode(auth, actionCode)
      .then((email) => {
        // Save the new password.
        confirmPasswordReset(auth, actionCode, newPassword)
          .then((resp) => {
            // const user = userCredential.user;
            ReactSession.set("email", email);
            setIsSuccess(true);

            navigate("/login");
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="login-bg">
      <MDBContainer className="d-flex align-items-center justify-content-center p-4">
        <MDBRow>
          <MDBCol>
            <MDBCard
              className="shadow-2 d-flex align-items-center"
              style={{ padding: "80px", margin: "20px" }}
            >
              <Snackbar
                style={{ position: "absolute" }}
                open={isSuccess}
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
                autoHideDuration={6000}
              >
                <Alert severity="success" sx={4}>
                  Password reset successfully
                </Alert>
              </Snackbar>
              <MDBCard
                className="shadow-2"
                style={{ cursor: "pointer", width: "100px", height: "100px" }}
              >
                <MDBCardImage position="top" src={logo}></MDBCardImage>
              </MDBCard>
              <div>
                <h3>Password resetting</h3>
              </div>
              <div>
                <Snackbar
                  style={{ position: "absolute" }}
                  open={netConnection}
                  anchorOrigin={{ horizontal: "center", vertical: "top" }}
                  autoHideDuration={6000}
                  onClose={() => {
                    setNetConnection(false);
                  }}
                >
                  <Alert severity="error" sx={4}>
                    No internet connection
                  </Alert>
                </Snackbar>

                <TextInput
                  tValue={(e) => {
                    setNewPassword(e);
                    setUserCorrect(false);
                  }}
                  tLabel="New password"
                  tType="password"
                />

                <Collapse in={userCorrect}>
                  <Alert className="pt-1" severity="error">
                    Invalid input
                  </Alert>
                </Collapse>

                <TextInput
                  tValue={(e) => {
                    setConfirmPassword(e);
                    setPasswordCorrect(false);
                  }}
                  tType="password"
                  tLabel="Confirm password"
                />

                <Collapse in={passwordCorrect}>
                  <Alert className="pt-1" severity="error">
                    Invalid input
                  </Alert>
                </Collapse>
              </div>
              <div>
                <Collapse in={isMatched}>
                  <Alert className="pt-1" severity="error">
                    Password didn't match
                  </Alert>
                </Collapse>
              </div>
              <div>
                <Collapse in={progress}>
                  <Stack style={{ color: "grey.500" }} spacing={0.5}>
                    <Spinner />
                  </Stack>
                </Collapse>
                <MDBBtn
                  onClick={() => {
                    handleSubmit();
                  }}
                  className="mt-1 button"
                  type="submit"
                  disabled={progress}
                >
                  SUBMIT
                </MDBBtn>
              </div>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}
