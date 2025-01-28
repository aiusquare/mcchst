import {
  MDBBtn,
  MDBCard,
  MDBCol,
  MDBContainer,
  MDBRow,
} from "mdb-react-ui-kit";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import * as React from "react";
import TextInput from "./textField";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loader } from "../LoadingSpinner";
import { Toast } from "../errorNotifier";
import Swal from "sweetalert2";
import request from "superagent";
import MenuItem from "@mui/material/MenuItem";
import SelectionBox from "../SelectionBox";
import { accesses } from "../Arrays";

export default function AdminLoginComponent() {
  const staffStatuses = [
    { name: "Junior Staff", code: "JS" },
    { name: "Senior Staff", code: "SS" },
    { name: "Parttime Staff", code: "PT" },
    { name: "Principal Officer", code: "PO" },
    { name: "Management Staff", code: "MO" },
  ];

  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [access, setAccess] = useState("");
  const [accessMode, setAccessMode] = useState("readOnly");
  const [userStatus, setUserStatus] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  const handleUserCreation = async () => {
    const data = {
      fullname: fullname,
      user_id: userId,
      email: email,
      phone_number: phoneNumber,
      status: userStatus,
      access: access,
      mode: accessMode,
      password: password,
    };

    if (validateForm()) {
      if (navigator.onLine) {
        loader({ title: "Creating User", text: "please wait..." });

        await request
          .post("https://api.mcchstfuntua.edu.ng/admin/create_user.php")
          .type("application/json")
          .send(data)
          .then((response) => {
            Toast.fire({
              icon: "success",
              title: "Successfully created",
            });

            navigate("/admin/users");
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
      } else {
        Toast.fire({
          icon: "error",
          title: "No internet connection",
        });
      }
    }
  };

  const validateForm = () => {
    if (fullname === "") {
      Toast.fire({
        icon: "error",
        title: "Full name must be provided",
      });

      return false;
    }
    if (userId === "") {
      Toast.fire({
        icon: "error",
        title: "User ID must be provided",
      });

      return false;
    }
    if (phoneNumber === "") {
      Toast.fire({
        icon: "error",
        title: "Phone number must be provided",
      });

      return false;
    }

    if (staffStatuses === "") {
      Toast.fire({
        icon: "error",
        title: "Please select status",
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

    // Regular expression for validating a Nigerian phone number
    const phoneNumberRegex = /^(\+234|0)([7-9]{1})([0-9]{9})$/;

    // Check if the phone number is valid and doesn't contain alphabets
    const isValid =
      phoneNumberRegex.test(phoneNumber) && !/[a-zA-Z]/.test(phoneNumber);
    if (!isValid) {
      Toast.fire({
        icon: "error",
        title: `Invalid phone number. The valid format is +234XXXX or just 070XXXX`,
      });
      return false;
    }

    // Regular expression for validating an email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if the email address is valid
    const isValidEmail = emailRegex.test(email);
    if (!isValidEmail) {
      Toast.fire({
        icon: "error",
        title: `Invalid email please check and try again.`,
      });
      return false;
    }

    if (password !== confirmPassword) {
      Toast.fire({
        icon: "error",
        title:
          "Password and Confirm password mismatch, please check and provide correct one",
      });

      return false;
    }

    if (hasAdminAccess) {
      if (access === "") {
        Toast.fire({
          icon: "error",
          title: "Please select user access type",
        });

        return false;
      }
    }

    return true;
  };

  return (
    <div className="login-bg">
      <MDBContainer>
        <MDBCard className="shadow-0 d-flex flex-column align-items-center m-2">
          <div style={{ fontWeight: "900", padding: "20px" }}>
            CREATING USER
          </div>

          <MDBRow className="m-2">
            <MDBCol>
              <TextInput tValue={setFullname} tLabel="Full Name" tType="text" />
              <TextInput tValue={setUserId} tLabel="User ID" tType="text" />
              <TextInput tValue={setEmail} tLabel="Email" tType="email" />
              <TextInput
                tValue={setPhoneNumber}
                tLabel="Phone Number"
                tType="text"
              />

              <SelectionBox
                label="Status"
                className="center-cmp"
                value={userStatus}
                changed={(e) => {
                  setUserStatus(e);
                }}
                content={staffStatuses.map((status) => {
                  return <MenuItem value={status.name}>{status.name}</MenuItem>;
                })}
              />
              <TextInput
                tValue={setPassword}
                tType="password"
                tLabel="password"
              />
              <TextInput
                tValue={setConfirmPassword}
                tType="password"
                tLabel="confirm password"
              />

              <FormControlLabel
                control={<input className="reg-radio" type="checkbox" />}
                label="Administrative access"
                checked={hasAdminAccess}
                onChange={() => {
                  if (hasAdminAccess) {
                    setHasAdminAccess(false);
                    setAccess("");
                    setAccessMode("");
                  } else {
                    setHasAdminAccess(true);
                  }
                }}
              />

              {hasAdminAccess && (
                <div>
                  <SelectionBox
                    label="User Access"
                    className="center-cmp"
                    value={access}
                    changed={(e) => {
                      setAccess(e);
                      if (e === "siteAdmin" || e === "fullAccess") {
                        setAccessMode("readWrite");
                      } else {
                        setAccessMode("readOnly");
                      }
                    }}
                    content={accesses.map((access) => {
                      return (
                        <MenuItem value={access.code}>{access.name}</MenuItem>
                      );
                    })}
                  />

                  <RadioGroup
                    value={accessMode}
                    onChange={(e) => {
                      setAccessMode(e.target.value);
                    }}
                    className="m-2"
                  >
                    <span style={{ color: "green", fontWeight: 900 }}>
                      Mode
                    </span>
                    <FormControlLabel
                      value="readOnly"
                      control={<Radio />}
                      label="Read Only"
                    />
                    <FormControlLabel
                      value="readWrite"
                      control={<Radio />}
                      label="Read and Write"
                    />
                  </RadioGroup>
                </div>
              )}
            </MDBCol>
          </MDBRow>

          <MDBRow className="m-2 ">
            <MDBCol>
              <MDBBtn
                style={{ background: "#05321e" }}
                className="mt-1 button"
                type="submit"
                onClick={handleUserCreation}
                // disabled={progress}
              >
                CREATE USER
              </MDBBtn>
            </MDBCol>
          </MDBRow>
        </MDBCard>
      </MDBContainer>
    </div>
  );
}
