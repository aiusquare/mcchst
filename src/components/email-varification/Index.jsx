import React, { useEffect, useState } from "react";
import { Button } from "../button";
import { TextField } from "../text-field/components/TextField";
import logo from "../../pictures/logo.png";
import "./style.css";
import { useLocation, useNavigate } from "react-router-dom";
import request from "superagent";
import Swal from "sweetalert2";
import { Toast } from "../errorNotifier";
import { loader } from "../LoadingSpinner";
import userIco from "../../pictures/user2.png";
import passwordIco from "../../pictures/password.png";
import emailIco from "../../pictures/email.png";
import phoneIco from "../../pictures/contactIcon.png";
import referrerIco from "../../pictures/referrer.png";

export const EmailVarificationComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [otherName, setOtherName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referrer, setReferrer] = useState("");

  const handleSubmit = async () => {
    if (validateForm() === true) {
      const data = {
        firstName: stringFormatter(firstName),
        surname: stringFormatter(surname),
        otherName: stringFormatter(otherName),
        email: email.toLowerCase(), // Add parentheses to call the toLowerCase method
        phone: phone,
        password: password,
        referrer: referrer,
      };

      if (navigator.onLine) {
        // progress spinner
        loader({
          title: "Submitting your data",
          text: "Please! wait while we save and verify your details.",
        });

        await request
          .post("https://api.mcchstfuntua.edu.ng/application.php")
          .type("application/json")
          .send(data)
          .then((response) => {
            const message = response.body.message;

            Swal.fire({
              title: "Success!",
              text: message,
              icon: "success",
              
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/login");
              }
            });
          })
          .catch((err) => {
            let errorText = err.response.text;
            // console.log(errorText);

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

  useEffect(() => {
    // Function to extract referral code from URL
    const extractReferralCode = () => {
      const searchParams = new URLSearchParams(location.search);
      const codeFromURL = searchParams.get("ref");

      if (codeFromURL) {
        // Set referral code state
        setReferrer(codeFromURL);
      }
    };

    extractReferralCode();
  }, []); // Trigger when location.search changes

  const stringFormatter = (e) => {
    const inputValue = e;
    // Convert to lowercase and capitalize each word
    const formattedValue = inputValue
      .toLowerCase()
      .replace(/(^|\s)\S/g, (match) => match.toUpperCase());

    return formattedValue;
  };

  const validateForm = () => {
    if (firstName === "") {
      Toast.fire({
        icon: "error",
        title: "First name must be provided",
      });

      return false;
    }
    if (surname === "") {
      Toast.fire({
        icon: "error",
        title: "Surname must be provided",
      });

      return false;
    }
    if (email === "") {
      Toast.fire({
        icon: "error",
        title: "Email must be provided",
      });

      return false;
    }
    if (phone === "") {
      Toast.fire({
        icon: "error",
        title: "Phone number must be provided",
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
    const isValid = phoneNumberRegex.test(phone) && !/[a-zA-Z]/.test(phone);
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
        <TextField
          setValue={setFirstName}
          placeholder="First name"
          type="text"
          iconUser={userIco}
        />
        <TextField
          iconUser={userIco}
          setValue={setSurname}
          placeholder="Surname"
          type="text"
        />
        <TextField
          setValue={setOtherName}
          placeholder="Other name"
          type="text"
          iconUser={userIco}
        />
        <TextField
          iconUser={emailIco}
          setValue={setEmail}
          placeholder="Email"
          type="email"
        />
        <TextField
          iconUser={phoneIco}
          setValue={setPhone}
          placeholder="Phone number"
          type="phone"
        />
        <TextField
          iconUser={passwordIco}
          setValue={setPassword}
          placeholder="Password"
          type="password"
        />
        <TextField
          iconUser={passwordIco}
          setValue={setConfirmPassword}
          placeholder="Confirm Password"
          type="password"
        />
        {referrer === "" && (
          <TextField
            iconUser={referrerIco}
            setValue={setReferrer}
            placeholder="Referrer (Optional)"
            type="text"
          />
        )}

        {referrer !== "" && (
          <div style={{ fontWeight: 900, color: "goldenrod" }}>
            Referral code: {referrer}{" "}
          </div>
        )}

        <div className="button-container" style={{ height: "50px" }}>
          <Button
            handleClick={() => {
              handleSubmit();
            }}
            label="Verify Email"
          />
        </div>
      </div>
    </div>
  );
};
