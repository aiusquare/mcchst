import * as React from "react";
import Paper from "@mui/material/Paper";
import "../admin/css/style.css";
import {
  MDBBtn,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBInput,
  MDBRow,
} from "mdb-react-ui-kit";
import { useState } from "react";
import request from "superagent";
import { loader } from "../LoadingSpinner.js";
import Swal from "sweetalert2";
import { Toast } from "../errorNotifier.js";

export default function SiteAdminTab() {
  const [stdId, setStdId] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const resetUserPassword = async () => {
    console.log("COURSES ON OFFER", resetEmail);

    if (navigator.onLine) {
      // progress spinner
      loader({
        title: "Resetting",
        text: "Please! wait.",
      });

      const data = { Email: resetEmail };

      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/user_password_reset.php")
        .type("application/json")
        .send(data)
        .then((response) => {
          Toast.fire({
            icon: "success",
            title: "Resetted successfully",
          });

          setResetEmail("");
        })
        .catch((err) => {
          let errorText = err.response.text;
          console.log(errorText);

          Swal.fire({
            title: "Error!",
            text: errorText,
            icon: "error",
          });
        });
    } else {
      Toast.fire({
        icon: "error",
        title: "No internet connection",
      });
    }
  };

  const resetUserEmail = async () => {
    console.log("COURSES ON OFFER", resetEmail);

    if (navigator.onLine) {
      // progress spinner
      loader({
        title: "Resetting",
        text: "Please! wait.",
      });

      const data = { Email: resetEmail };

      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/user_email_reset.php")
        .type("application/json")
        .send(data)
        .then((response) => {
          Toast.fire({
            icon: "success",
            title: "Resetted successfully",
          });

          setResetEmail("");
        })
        .catch((err) => {
          let errorText = err.response.text;
          console.log(errorText);

          Swal.fire({
            title: "Error!",
            text: errorText,
            icon: "error",
          });
        });
    } else {
      Toast.fire({
        icon: "error",
        title: "No internet connection",
      });
    }
  };

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>Site Management</h4>
        </MDBCardText>
      </MDBCardBody>
      <Paper className="p-2 my-2 w-100">
        <div style={{ fontWeight: "900", padding: "20px" }}>
          User Password Reset
        </div>

        <MDBRow>
          <MDBCol>
            <div className="d-flex align-items-center">
              <MDBInput
                label="Reset email"
                value={resetEmail}
                type="text"
                onChange={(e) => {
                  setResetEmail(e.target.value);
                }}
                size="lg"
              />

              <MDBBtn
                className="w-25"
                size="lg"
                style={{ background: "#05321e" }}
                onClick={resetUserPassword}
              >
                Reset
              </MDBBtn>
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>

      <Paper className="p-2 my-2 w-100">
        <div style={{ fontWeight: "900", padding: "20px" }}>
          Change student email
        </div>

        <MDBRow>
          <MDBCol>
            <div className="d-flex align-items-center">
              <MDBInput
                className="mb-2"
                label="Application id or phone number"
                value={stdId}
                type="text"
                onChange={(e) => {
                  setStdId(e.target.value);
                }}
                size="lg"
              />
            </div>
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol>
            <MDBInput
              className="mt-2"
              label="New email"
              value={newEmail}
              type="text"
              onChange={(e) => {
                setNewEmail(e.target.value);
              }}
              size="lg"
            />

            <MDBBtn
              className="w-50"
              size="lg"
              style={{ background: "#05321e" }}
              // onClick={resetUserPassword}
            >
              Reset
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
}
