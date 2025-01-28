import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { Alert } from "@mui/material";
import { Collapse } from "@mui/material";
import "../css/style.css";
import { MDBBtn } from "mdb-react-ui-kit";
import request from "superagent";
import { Toast } from "./errorNotifier";
import { loader } from "./LoadingSpinner";
import Swal from "sweetalert2";

const PinAuthComponent = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authCodeText, setAuthCodeText] = useState("");
  const [passText, setPassText] = useState("");
  const [isAuthCodeInCorrect, setIsAuthCodeInCorrect] = useState(false);
  const [isPasswordInCorrect, setIsPasswordInCorrect] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleSu = async (e) => {
    e.preventDefault();

    // fetch("./data/authData.csv")
    //   .then((response) => response.text())
    //   .then((responseText) => {
    //     // parsing csv
    //     let authCodes = Papa.parse(responseText);
    //     let authCodeCorrect = false;
    //     let passwordCorrect = false;
    //     authCodes.data.map((row) => {
    //       const authcode = row[0];
    //       const password = row[1];
    //       if (authCodeText === authcode) {
    //         authCodeCorrect = true;
    //         if (passText === password) {
    //           passwordCorrect = true;
    //           // navigating to registration window
    //           props.navigation("registration");
    //           console.log("data:", authCodes);
    //           return;
    //         }
    //         if (!passwordCorrect) {
    //           setIsPasswordInCorrect(true);
    //         } else {
    //           setIsPasswordInCorrect(false);
    //         }
    //       }
    //     });
    //     if (!authCodeCorrect) {
    //       setIsAuthCodeInCorrect(true);
    //     } else {
    //       setIsAuthCodeInCorrect(false);
    //     }
    //   });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsAuthCodeInCorrect(false);
    setIsPasswordInCorrect(false);

    const data = {
      Email: userEmail,
      AccessPin: authCodeText,
      AccessPassword: passText,
    };

    if (validateForm()) {
      if (navigator.onLine) {
        loader({ title: "Login", text: "please wait..." });

        await request
          .post("https://api.mcchstfuntua.edu.ng/access_auth.php")
          .type("application/json")
          .send(data)
          .then((response) => {
            Swal.fire({
              title: "Success",
              text: "Access approved, you can now login",
              icon: "success",
            }).then(() => {
              navigate("/login");
            });
          })
          .catch((err) => {
            Swal.fire({
              title: "Error!",
              text: handleError(err),
              icon: "error",
            });
          });
      } else {
        Toast.fire({
          icon: "error",
          title: "No internet connection",
        });
      }
    }
  };

  useEffect(() => {
    if (!location.state || !location.state.userEmail) {
      navigate("/login");
    } else {
      setUserEmail(location.state.userEmail);
    }
  });

  const handleError = (error) => {
    const errorMessage = error.toString();

    const regex =
      /Request has been terminated|the network is offline|Origin is not allowed by Access-Control-Allow-Origin|the page is being unloaded|Parser is unable to parse the response/i;

    if (regex.test(errorMessage)) {
      return "Poor network, please try again";
    } else {
      // Attempt to return a meaningful message from the error object
      if (error.response && error.response.data && error.response.data.error) {
        return error.response.data.error;
      } else if (error.message) {
        return error.message;
      } else {
        return errorMessage;
      }
    }
  };

  const validateForm = () => {
    if (authCodeText === "") {
      Toast.fire({
        icon: "error",
        title: "Access Pin must be provided",
      });

      return false;
    }

    if (passText === "") {
      Toast.fire({
        icon: "error",
        title: "Password must be provided",
      });

      return false;
    }

    return true;
  };

  const handleAuthCodeChange = (e) => {
    setAuthCodeText(e.target.value);
  };

  const handlePassCodeChange = (e) => {
    setPassText(e.target.value);
  };

  useEffect(() => {}, []);

  return (
    <div className="card message-login admission">
      <div>
        <form onSubmit={handleSubmit}>
          <div className="center">
            <h1>
              <em>Access Authentication Form</em>
            </h1>
            <div>
              <TextField
                required
                label="Application pin"
                value={authCodeText}
                variant="outlined"
                margin="normal"
                className="w-100"
                onChange={handleAuthCodeChange}
              />
              <Collapse in={isAuthCodeInCorrect}>
                <Alert
                  style={{ marginLeft: "25%", width: "50%", padding: 1 }}
                  variant="filled"
                  severity="error"
                >
                  Application pin incorrect
                </Alert>
              </Collapse>
            </div>
            <div>
              <TextField
                required
                label="Password"
                type="password"
                value={passText}
                variant="outlined"
                className="w-100"
                onChange={handlePassCodeChange}
              />
              <Collapse in={isPasswordInCorrect}>
                <Alert
                  style={{ marginLeft: "25%", width: "50%", padding: 1 }}
                  variant="filled"
                  severity="error"
                >
                  Password entered is incorrect
                </Alert>
              </Collapse>
            </div>

            <div>
              <MDBBtn
                style={{ backgroundColor: "#05321e" }}
                type="submit"
                className="m-2 w-50"
              >
                Verify
              </MDBBtn>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinAuthComponent;
