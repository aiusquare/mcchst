import { MDBBtn, MDBCol, MDBContainer, MDBRow } from "mdb-react-ui-kit";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DropModal from "reboron/DropModal";

const SuccessAlert = (props) => {
  const refModal = useRef(null);
  const navigate = useNavigate();
  const message = props.message;

  useEffect(() => {
    if (props.showMe) {
      showModal();
    }
  }, [props.showMe]);

  const showModal = () => {
    refModal.current.show();
  };

  const hideModal = () => {
    refModal.current.hide();
  };

  return (
    <DropModal
      className="rounded s-dialod-box d-flex justify-content-center align-items-center"
      ref={refModal}
      closeOnClick={false}
      keyboard={() => this.callback()}
    >
      <MDBContainer className="d-flex flex-column align-items-center justify-content-center p-4">
        <MDBRow>
          <MDBCol className="d-flex justify-content-center align-items-center text-center">
            <div>{message}</div>
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol>
            <MDBBtn
              onClick={() => {
                let nav = props.nav;
                if (nav === "/login") {
                  navigate(props.nav);
                } else {
                  window.location.reload();
                }
                hideModal();
              }}
              className="m-2 p-2 w-100"
            >
              Okay
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </DropModal>
  );
};

export default SuccessAlert;
