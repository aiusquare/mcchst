// Simple placeholder spinner and loader helper without external deps
import React from "react";
import Swal from "sweetalert2";

export const loader = ({ title = "Loading", text = "Please wait..." } = {}) => {
  Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });
};

const LoadingSpinner = () => (
  <div className="d-flex align-items-center justify-content-center p-4">
    <div
      className="spinner-border text-primary"
      role="status"
      aria-label="loading"
    />
  </div>
);

export default LoadingSpinner;
