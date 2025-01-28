import React, { useState } from "react";
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
import codeIco from "../../pictures/access_code.png";
import passwordIco from "../../pictures/password.png";

export const ForgetPasswordComponent = () => {
  const navigate = useNavigate();

  const [vcode, setVCode] = useState(false);
  const [newpassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async () => {
    const data = {
      new_password: newpassword,
      vcode: vcode,
    };

    if (validateForm()) {
      if (navigator.onLine) {
        loader({ title: "Recovering", text: "please wait..." });

        await request
          .post("https://api.mcchstfuntua.edu.ng/changeAuth.php")
          .type("application/json")
          .send(data)
          .then((response) => {
            Swal.fire({
              title: "Recovered",
              text: "We have successfully recover your password. you can now proceed",
              icon: "success",
            }).then(() => {
              navigate("/login");
            });
          })
          .catch((err) => {
            let errorText = err.response.text;
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
    }
  };

  const validateForm = () => {
    if (newpassword === "") {
      Toast.fire({
        icon: "error",
        title: "New password must be provided",
      });

      return false;
    }

    if (newpassword !== confirmPassword) {
      Toast.fire({
        icon: "error",
        title: "New password has a mismatch with confirm password",
      });

      return false;
    }

    if (vcode === "") {
      Toast.fire({
        icon: "error",
        title: "Verification code must be provided",
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
          Password Recovery
        </h1>
        <TextField
          iconUser={codeIco}
          setValue={setVCode}
          placeholder="confirmation code"
          type="number"
        />
        <TextField
          iconUser={passwordIco}
          setValue={setNewPassword}
          placeholder="new password"
          type="password"
        />
        <TextField
          iconUser={passwordIco}
          setValue={setConfirmPassword}
          placeholder="confirm password"
          type="password"
        />

        <div className="button-container">
          <Button
            handleClick={() => {
              handleLogin();
            }}
            className="button-instance"
            label="Reset"
          />
        </div>
      </div>
    </div>
  );
};
