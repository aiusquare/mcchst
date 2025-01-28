import React, { useContext, useEffect, useRef, useState } from "react";
// import Modal from "reboron/DropModal";
import {
  MDBBtn,
  MDBCard,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBContainer,
} from "mdb-react-ui-kit";
import { Alert, Collapse, Snackbar, Stack, TextField } from "@mui/material";
import logo from "../pictures/am_data.png";
// import Spinner from "./spinner";
import request from "superagent";
import { useNavigate } from "react-router-dom";

const EmailVericationAlert = (props) => {
  const navigate = useNavigate();
  const code = props.code;
  const applicationId = props.applicantId;
  const userEmail = props.email;

  const refAtm = useRef(null);
  const [varifyCode, setVarifyCode] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (props.showMe) {
      showModal();
    }
  }, [props.showMe]);

  const showModal = () => {
    refAtm.current && refAtm.current.show();
  };

  const hideModal = () => {
    refAtm.current && refAtm.current.hide();
    props.fund(false);
  };

  const handleValidateEmail = async (applicationId) => {};

  return (
    <div>
      {/* <Modal
        className="rounded center s-dialod-box w-75"
        ref={refAtm}
        closeOnClick={false}
        keyboard={() => this.callback()}
      > */}
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
              <h4 style={{ textAlign: "center" }}>EMAIL VARIFICATION</h4>
              <div className="mx-4" style={{ textAlign: "center" }}>
                Please enter the four digit code sent to your email to enable us
                complete your email varification.
              </div>
              <Snackbar
                open={error}
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
                autoHideDuration={6000}
                onClose={() => {
                  setError(false);
                }}
              >
                <Alert severity="error" sx={8}>
                  {errorMessage}
                </Alert>
              </Snackbar>

              <MDBCard>
                <TextField
                  className="m-2"
                  onChange={(e) => {
                    setVarifyCode(e.target.value);
                  }}
                  type="number"
                  InputProps={{
                    inputProps: {
                      style: { textAlign: "center" },
                    },
                  }}
                />
              </MDBCard>
              <Collapse className="m-3" in={disableBtn}>
                <Stack style={{ color: "grey.500" }} spacing={0.5}>
                  {/* <Spinner /> */}
                </Stack>
              </Collapse>
              <div className="d-flex align-items-center justify-content-center">
                <MDBBtn
                  disabled={disableBtn}
                  onClick={async () => {
                    if (code === varifyCode) {
                      //i am going to call an api to to update the recode to varify
                      handleValidateEmail(applicationId);
                    } else {
                      setError(true);
                    }
                  }}
                  className="m-2 p-2 w-50 button"
                  style={{ background: "#3a881f" }}
                >
                  PROCEED
                </MDBBtn>
                <MDBBtn
                  style={{ background: "#3a881f" }}
                  disabled={disableBtn}
                  onClick={() => {
                    setDisableBtn(false);
                    hideModal();
                  }}
                  className="m-2 p-2 w-50 button"
                >
                  Cancel
                </MDBBtn>
              </div>
            </div>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      {/* </Modal> */}
    </div>
  );
};

export default EmailVericationAlert;
