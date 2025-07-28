import { useState } from "react";
import { Button } from "../button/";
import { TextField } from "../text-field/components/TextField";
import logo from "../../pictures/logo.png";
import request from "superagent";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { Toast } from "../errorNotifier";
import { loader } from "../LoadingSpinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import userIco from "../../pictures/user2.png";
import passwordIco from "../../pictures/password.png";

export const LoginComponent = () => {
  const navigate = useNavigate();

  const [verifyEmail, setVerifyEmail] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [varificationCode, setVarificationCode] = useState("");
  const [applicantId, setApplicantId] = useState("");
  const [password, setPassword] = useState("");
  const [emailVaricationCode, setEmailVarificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  {
    verifyEmail &&
      withReactContent(Swal).fire({
        title: "Code Varification",
        html:
          "Please enter the varificataion code sent to your email to confirm it's validity <br />" +
          "<span style='color: red; font-size: 12px; font-weight: 700'>" +
          errorMsg +
          "</span>",
        input: "text",
        allowOutsideClick: false,
        allowEscapeKey: false,
        preConfirm: () => {
          if (Swal.getInput().value === varificationCode) {
            Swal.fire({
              title: "Varifying...",
              html: "Please wait while we varify your email",
              allowOutsideClick: false,
              allowEscapeKey: false,
              timerProgressBar: false,
              didOpen: async () => {
                Swal.showLoading();

                const data = {
                  applicationId: applicantId,
                };

                await request
                  .post("https://api.mcchstfuntua.edu.ng/emailValidation.php")
                  .type("application/json")
                  .send(data)
                  .then((response) => {
                    if (response.text === "ok") {
                      Swal.fire({
                        title: "Varified",
                        text: "We have successfully varify your email. you can now proceed",
                        icon: "success",
                      }).then(() => {
                        navigate("/payment", {
                          state: { userEmail: email },
                        });
                      });
                    }
                  })
                  .catch((err) => {
                    console.log("Error message:", err.response);

                    if (err.response && err.response.status === 400) {
                      // Handle the error response with status code 400
                      console.log("ERROR HERE", err.response.text);
                    } else {
                      // Handle other types of errors (e.g., network errors)
                      console.error("Network error:", err);
                    }
                  });
              },
            });
          } else {
            setErrorMsg("the code provided is invalid");
          }
        },
      });
  }

  const handleLogin = async () => {
   
    const data = {
      applicationId: loginId,
      password: password,
    };

    if (validateForm()) {
      if (navigator.onLine) {
        loader({ title: "Login", text: "please wait..." });

        await request
          .post("https://api.mcchstfuntua.edu.ng/login.php")
          .type("application/json")
          .send(data)
          .then((response) => {
            Toast.fire({
              icon: "success",
              title: "Logged successfully",
            });

            // setting login session
            localStorage.setItem("lastActivityTime", Date.now().toString());

            // console.log("Response body:", response.body);

            const varificationStatus = response.body.eVarified;
            const paymentStatus = response.body.Paid;
            const userEmail = response.body.Email;
            const isRegistered = response.body.IsRegistered;
            const isAdmitted = response.body.admitted;
            const hasPaidAcceptance = response.body.HasPaidAcceptance; // acceptance fee payment check
            const isValidated = response.body.IsValidated; // checking for whether user has varified his data
            const hasApprovedByHOD = response.body.HasApprovedByHOD;

            setVarificationCode(response.body.vPin);
            setEmail(userEmail);
            setApplicantId(response.body.ApplicationId);
            setEmailVarificationCode(varificationCode);

            // if (varificationStatus === "yes") {
            if (paymentStatus === "yes") {
              if (isAdmitted === "yes") {
                if (hasPaidAcceptance === "yes") {
                  // if (isValidated === "yes") {
                  // student will be taken to his portal where he will proceed with other registration activities
                  navigate("/portal", { state: { userData: response.body } });
                  localStorage.setItem("userEmail", userEmail);
                  // } else {
                  //   navigate("/validation", {
                  //     state: { userData: response.body },
                  //   });
                  // }
                } else {
                  if (hasApprovedByHOD === "yes") {
                    navigate("/acceptance", {
                      state: { userData: response.body },
                    });
                  } else {
                    navigate("/reg-1", {
                      state: { userData: response.body },
                    });
                  }
                }
              } else if (isAdmitted === "no") {
                navigate("/login");
              } else {
                if (isRegistered === "yes") {
                  navigate("/applicant-profile", {
                    state: { userEmail: userEmail },
                  });
                } else {
                  navigate("/registration", {
                    state: { userData: response.body },
                  });
                }
              }
            } else {
              navigate("/payment", {
                state: { userData: response.body },
              });
            }
            // } else {
            //   setVerifyEmail(true);
            // }
          })
          .catch((err) => {
            let errorMessage = err.toString();

            if (errorMessage.includes("Request has been terminated")) {
              Swal.fire({
                title: "Network Issue!",
                text: "You have a very poor network. Please try again later.",
                icon: "warning",
              });
            } else {
              Swal.fire({
                title: "Error!",
                text: errorMessage,
                icon: "error",
              });
            }
          });
      } else {
        Toast.fire({
          icon: "error",
          title: "No internet connection",
        });
      }
    }
  };

  const validateForm = () => {
    if (loginId === "") {
      Toast.fire({
        icon: "error",
        title: "Email must be provided",
      });

      return false;
    }

    if (password === "") {
      Toast.fire({
        icon: "error",
        title: "Password must be provided",
      });

      return false;
    }

    return true;
  };

  return (
    <div className="index">
      <div className="container">
        <img
          onClick={() => {
            navigate("/");
          }}
          className="LOGO-MCCHST"
          alt="Logo MCCHST"
          src={logo}
        />
        <h1 className="p-2" style={{ color: "white" }}>
          Portal Login
        </h1>
        <TextField
          iconUser={userIco}
          setValue={setLoginId}
          placeholder="Email or Phone number"
          type="email"
        />
        <TextField
          iconUser={passwordIco}
          setValue={setPassword}
          placeholder="Password"
          type="password"
        />

        <div
          style={{ color: "gold", cursor: "pointer", fontWeight: 900 }}
          onClick={() => {
            withReactContent(Swal).fire({
              title: "Password recovery",
              html: "Please enter your registered email, we will send you verification code there, use it to complete pasword recovery in the next screen.",
              input: "email",
              // allowOutsideClick: false,
              // allowEscapeKey: false,
              preConfirm: async () => {
                const suppliedEmail = Swal.getInput().value;
                loader({ title: "Processing", text: "please wait..." });

                const data = {
                  email: suppliedEmail,
                };

                await request
                  .post("https://api.mcchstfuntua.edu.ng/auth_reset.php")
                  .type("application/json")
                  .send(data)
                  .then((response) => {
                    if (response.text === "ok") {
                      Swal.fire({
                        title: "Success",
                        text: "Please check your email for varification code",
                        icon: "success",
                      }).then(() => {
                        navigate("/forget-password");
                      });
                    }
                  })
                  .catch((err) => {
                    let errorText = "";

                    if (err.response) {
                      errorText = err.response.text;
                    } else {
                      errorText = "Network error, please check and try again";
                    }

                    Toast.fire({
                      icon: "error",
                      title: errorText,
                    });
                  });
              },
            });
          }}
        >
          forgot password?
        </div>

        <div className="button-container">
          <Button
            handleClick={() => {
              handleLogin();
            }}
            className="button-instance"
            label="Login"
          />
        </div>
      </div>
    </div>
  );
};
