import { Alert, Snackbar } from "@mui/material";
import Swal from "sweetalert2";

export const ErrorNotifier = (props) => {
  return (
    <div>
      <Snackbar
        open={props.show}
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        autoHideDuration={6000}
        onClose={props.onErrClose}
      >
        <Alert style={{ textAlign: "center" }} severity="error" sx={4}>
          {props.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});
