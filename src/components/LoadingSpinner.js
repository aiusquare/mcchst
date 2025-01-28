import React, { useContext, useEffect, useRef, useState } from "react";
import {
  MDBBtn,
  MDBCard,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBContainer,
} from "mdb-react-ui-kit";
import { Collapse, Stack } from "@mui/material";
// import DropModal from "boron/DropModal";
import Swal from "sweetalert2";

const LoadingSpiner = (props) => {
  const refAtm = useRef(null);

  const displayMessage = props.displayMessage;

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
      {/* <DropModal
        className="rounded center s-dialod-box w-75"
        ref={refAtm}
        closeOnClick={false}
        keyboard={() => this.callback()}
      > */}
      <MDBContainer className="d-flex flex-column align-items-center p-2">
        <MDBRow>
          <MDBCol>
            <Collapse className="m-3" in={true}>
              <Stack style={{ color: "grey.500" }} spacing={0.5}>
                {/* <Spinner displayMessage={displayMessage} /> */}
                here we are
              </Stack>
            </Collapse>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      {/* </DropModal> */}
    </div>
  );
};

export const loader = ({ title, text }) => {
  Swal.fire({
    title: title,
    html: text,
    allowOutsideClick: false, // Disallow closing on click outside the modal
    allowEscapeKey: false,
    timerProgressBar: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export default LoadingSpiner;
