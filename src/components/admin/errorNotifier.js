import { Alert, Snackbar } from "@mui/material";

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
