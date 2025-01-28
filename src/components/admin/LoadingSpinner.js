import React, { Component, useRef } from "react";
import Modal from "reboron/DropModal";
import { MDBInput, MDBBtn, MDBCard } from "mdb-react-ui-kit";
import { BallTriangle } from "react-loader-spinner";

const LoadingSpinner = () => {
  const refModal = useRef(null);

  const showModal = () => {
    refModal.current.show();
  };

  const hideModal = () => {
    refModal.current.hide();
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => showModal()}>Open</button>
      <Modal
        ref={refModal}
        closeOnClick={false}
        backdropStyle={{
          backgroundColor: "ash",
        }}
        keyboard={() => this.callback()}
      >
        <div style={{ margin: "50px", alignContent: "center" }}>
          <BallTriangle
            height={100}
            width={100}
            radius={5}
            color="#4fa94d"
            ariaLabel="ball-triangle-loading"
            wrapperClass={{}}
            wrapperStyle=""
            visible={true}
          />
        </div>
      </Modal>
    </div>
  );
};

export default LoadingSpinner;
