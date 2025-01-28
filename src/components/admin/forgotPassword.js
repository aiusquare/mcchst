import React, { useEffect, useRef, useState } from "react";
import Modal from "reboron/DropModal";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import {
  MDBBtn,
  MDBCard,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBContainer,
} from "mdb-react-ui-kit";
import {
  Alert,
  Collapse,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import logo from "../pictures/am_data.png";

const ForgotPassword = (props) => {
  const refModal = useRef(null);
  const [email, setEmail] = useState("");
  const [netConnection, setNetConnection] = useState(false);
  const [message, setMessage] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);
  const auth = getAuth();

  const showModal = () => {
    refModal.current.show();
  };

  const hideModal = () => {
    refModal.current.hide();

    setDisableBtn(false);
  };

  if (email === "" && props.email !== "") {
    setEmail(props.email);
  }

  const showMe = props.showMe;

  useEffect(() => {
    if (showMe === true) {
      showModal();

      props.resetModel(false);
    }
  });

  const handlePasswordReset = () => {
    setDisableBtn(true);
    if (email === "") {
      setMessage("no email provided");
      setNetConnection(true);
      setDisableBtn(false);
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage("password reset email sent successfully");
        setDisableBtn(false);
        hideModal();
      })
      .catch((err) => {
        console.log(err.code);
        if (err.code === "auth/network-request-failed") {
          setMessage("there is problem with your network");
        } else if (
          err.code === "auth/invalid-email" ||
          err.code === "auth/user-not-found"
        ) {
          setMessage("incorrect email");
        }

        setNetConnection(true);
        setDisableBtn(false);
      });
  };

  return (
    <Modal
      className="rounded"
      ref={refModal}
      closeOnClick={false}
      keyboard={() => this.callback()}
    >
      <MDBContainer className="d-flex flex-column align-items-center justify-content-center p-2">
        <MDBRow>
          <MDBCol>
            <MDBCard
              className="m-4"
              style={{ cursor: "pointer", width: "80px", height: "80px" }}
            >
              <MDBCardImage position="top" src={logo}></MDBCardImage>
            </MDBCard>
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol>
            <div className="d-flex flex-column align-items-center justify-content-center p-2">
              <div>password reset</div>
              <Snackbar
                open={netConnection}
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
                autoHideDuration={6000}
                onClose={() => {
                  setNetConnection(false);
                }}
              >
                <Alert severity="error" sx={8}>
                  {message}
                </Alert>
              </Snackbar>
              <h4>please enter your registered email</h4>
              <MDBCard style={{ width: "100%" }}>
                <TextField
                  disabled={disableBtn}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  value={email}
                  type="email"
                  InputProps={{
                    inputProps: {
                      style: { textAlign: "center" },
                    },
                  }}
                />
              </MDBCard>
              <Collapse className="m-3" in={disableBtn}>
                <Stack style={{ color: "grey.500" }} spacing={0.5}>
                  <LinearProgress color="secondary" />
                  <LinearProgress color="success" />
                  <LinearProgress color="inherit" />
                </Stack>
              </Collapse>
              <div>
                <MDBBtn
                  disabled={disableBtn}
                  onClick={handlePasswordReset}
                  className="m-2 p-3"
                >
                  Reset Password
                </MDBBtn>
                <MDBBtn
                  onClick={() => {
                    hideModal();
                  }}
                  className="m-2 p-3 "
                >
                  Cancel
                </MDBBtn>
              </div>
            </div>
          </MDBCol>
        </MDBRow>{" "}
      </MDBContainer>
    </Modal>
  );
};

export default ForgotPassword;
