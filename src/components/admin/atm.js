import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from "reboron/DropModal";
import {
  MDBBtn,
  MDBCard,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBContainer,
} from "mdb-react-ui-kit";
import { Alert, Collapse, Snackbar, Stack, TextField } from "@mui/material";
import { usePaystackPayment } from "react-paystack";
import request from "superagent";
import logo from "../pictures/am_data.png";
import { ServiceComContext } from "./dashboard";
import { baseUrl } from "../../services/setup";
import Spinner from "./spinner";

const Atm = (props) => {
  const { userEmail } = useContext(ServiceComContext);

  const [walletFundingAmount, setWalletFundingAmount] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);
  const [inCorrectAmount, setIncorrectAmount] = useState(false);

  const config = {
    reference: "atm" + new Date().getTime().toString(),
    email: userEmail,
    amount: walletFundingAmount * 100,
    publicKey: "pk_live_2314178f8408f7d6baec1371d371118ecfd3032e",
  };

  let initializePayment = usePaystackPayment(config);

  const refAtm = useRef(null);

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

  return (
    <div>
      <Modal
        className="rounded center s-dialod-box"
        ref={refAtm}
        closeOnClick={false}
        keyboard={() => this.callback()}
      >
        <MDBContainer className="d-flex flex-column align-items-center p-2">
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
              <div>
                <h4 style={{ textAlign: "center" }}>
                  AUTOMATIC WALLET FUNDING
                </h4>
                <div className="mx-4" style={{ textAlign: "center" }}>
                  Please enter the desired amount
                </div>
                <Snackbar
                  open={inCorrectAmount}
                  anchorOrigin={{ horizontal: "center", vertical: "top" }}
                  autoHideDuration={6000}
                  onClose={() => {
                    setIncorrectAmount(false);
                  }}
                >
                  <Alert severity="error" sx={8}>
                    Amount must be N100 or above
                  </Alert>
                </Snackbar>

                <MDBCard>
                  <TextField
                    disabled={disableBtn}
                    onChange={(e) => {
                      setWalletFundingAmount(e.target.value);
                    }}
                    value={walletFundingAmount}
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
                    <Spinner />
                  </Stack>
                </Collapse>
                <div className="center">
                  <MDBBtn
                    disabled={disableBtn}
                    onClick={async () => {
                      if (
                        walletFundingAmount !== "" &&
                        walletFundingAmount >= 100
                      ) {
                        initializePayment({
                          onSuccess: async (response) => {
                            try {
                              await request
                                .post(baseUrl + "billing/verify_wallet_funding")
                                .send({
                                  TransactionReference: response.reference,
                                  userEmail: userEmail,
                                });
                            } catch (err) {
                              // payment verified by webhook; ignore network errors here
                            }
                          },
                          onClose: () => {},
                        });
                        hideModal();
                      } else {
                        setIncorrectAmount(true);
                      }
                    }}
                    className="m-2 p-2 w-25 button"
                  >
                    PROCEED
                  </MDBBtn>
                  <MDBBtn
                    disabled={disableBtn}
                    onClick={() => {
                      setDisableBtn(false);
                      hideModal();
                    }}
                    className="m-2 p-2 w-25 button"
                  >
                    Cancel
                  </MDBBtn>
                </div>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </Modal>
    </div>
  );
};

export default Atm;
