import {
  MDBBtn,
  MDBCard,
  MDBCardImage,
  MDBCol,
  MDBContainer,
  MDBRow,
} from "mdb-react-ui-kit";
import * as React from "react";
import logo from "../../pictures/logo.png";
import { Alert, Collapse, Stack } from "@mui/material";
import TextInput from "./textField";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loader } from "../LoadingSpinner";
import { Toast } from "../errorNotifier";
import Swal from "sweetalert2";
import request from "superagent";
// import Spinner from "./spinner";
// import { ReactSession } from "react-client-session";
// import ForgotPassword from "./forgotPassword";

export default function AdminLoginComponent() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(false);
  const [userCorrect, setUserCorrect] = useState(false);
  const [passwordCorrect, setPasswordCorrect] = useState(false);
  const [reset, setReset] = useState(false);

  const handleLogin = async () => {
    setUserCorrect(false);
    setPasswordCorrect(false);
    const data = {
      AdminId: userName,
      Password: password,
    };

    if (validateForm()) {
      if (navigator.onLine) {
        fetch("https://www.google.com/", { mode: "no-cors" })
          .then(async () => {
            await request
              .post("https://api.mcchstfuntua.edu.ng/admin/login.php")
              .type("application/json")
              .send(data)
              .then((response) => {
                Toast.fire({
                  icon: "success",
                  title: "Logged successfully",
                });

                console.log(response.body);

                if (response.body.password === "") {
                  localStorage.setItem("password_setup", "no");
                  navigate("/admin/create-password", {
                    state: { data: response.body },
                  });
                } else {
                  localStorage.setItem("password_setup", "yes");
                }

                // setting login session
                localStorage.setItem("adminLogin", Date.now().toString());

                const responseData = response.body;

                if (responseData.access === "admission") {
                  navigate("/admin/application");
                } else if (responseData.access === "finance") {
                  navigate("/admin/finance");
                } else if (responseData.access === "application") {
                  navigate("/admin/application");
                } else if (responseData.access === "officer") {
                  navigate("/admin/officers");
                } else {
                  navigate("/admin", { state: { data: responseData } });
                }

                localStorage.setItem("userId", responseData.user_id);
                localStorage.setItem("access", responseData.access);
                localStorage.setItem("mode", responseData.mode);
                localStorage.setItem("officeRole", responseData.office_role);
                localStorage.setItem("department", responseData.department);
              })
              .catch((err) => {
                let errorMsg = "";

                if (err.response && err.response.status === 400) {
                  // console.log("ERROR HERE", err.response.text);
                  errorMsg = err.response.text;
                } else {
                  // console.error("Network error:", err);
                  errorMsg = err;
                }

                Swal.fire({
                  title: "Error",
                  text: errorMsg,
                  icon: "error",
                });
              });
          })
          .catch((err) => {
            Toast.fire({
              icon: "error",
              title: "No internet connection or network problem",
            });
          });
        loader({ title: "Admin Login", text: "please wait..." });
      } else {
        Toast.fire({
          icon: "error",
          title: "No internet connection",
        });
      }
    }
  };

  const validateForm = () => {
    if (userName === "") {
      setUserCorrect(true);

      return false;
    }

    if (password === "") {
      setPasswordCorrect(true);

      return false;
    }

    return true;
  };

  return (
    <div className="login-bg">
      <MDBContainer>
        <MDBCard className="shadow-2 d-flex flex-column align-items-center m-4 p-4">
          <MDBCard
            className="shadow-2"
            style={{ cursor: "pointer", width: "100px" }}
          >
            <MDBCardImage position="top" src={logo}></MDBCardImage>
          </MDBCard>
          <MDBRow className="m-2">
            <MDBCol>
              <div class="text-center m-3">
                <h3>Admin Login</h3>
              </div>
            </MDBCol>
          </MDBRow>
          <MDBRow className="m-2">
            <MDBCol>
              <TextInput tValue={setUserName} tLabel="User name" tType="text" />

              <Collapse in={userCorrect}>
                <Alert className="pt-1" severity="error">
                  Fill the user name
                </Alert>
              </Collapse>

              <TextInput
                tValue={setPassword}
                tType="password"
                tLabel="password"
              />

              <Collapse in={passwordCorrect}>
                <Alert className="pt-1" severity="error">
                  Fill the password
                </Alert>
              </Collapse>
            </MDBCol>
          </MDBRow>

          <MDBRow className="m-2 ">
            <MDBCol>
              <Collapse in={progress}>
                <Stack style={{ color: "grey.500" }} spacing={0.5}></Stack>
              </Collapse>
              <MDBBtn
                style={{ background: "#05321e" }}
                className="mt-1 button"
                type="submit"
                onClick={handleLogin}
                disabled={progress}
              >
                SUBMIT
              </MDBBtn>
            </MDBCol>
          </MDBRow>
          <MDBRow className="m-2">
            <MDBCol>
              <Link
                style={{ color: "#05321e" }}
                className="d_link"
                to={""}
                onClick={() => {
                  setReset(true);
                }}
              >
                Forgot Password?
              </Link>
            </MDBCol>
          </MDBRow>
        </MDBCard>
      </MDBContainer>
    </div>
  );
}
