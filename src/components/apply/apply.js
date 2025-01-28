import React, { useEffect, useState } from "react";
import logo from "../../pictures/logo.png";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { Button } from "../button";
import Countdown from "../count-down/countdown";
import axios from "axios";

export const ApplyComponent = () => {
  const navigate = useNavigate();

  const [isExpired, setIsExpired] = useState(false);
  const [applicationOpeningDate, setApplicationOpeningDate] = useState(
    "2024-03-01T23:59:59+01:00"
  );
  const [applicationClosingDate, setApplicationClosingDate] = useState(
    "2024-03-01T23:59:59+01:00"
  );
  const [counterDate, setCounterDate] = useState("2024-03-01T23:59:59+01:00");
  const [eventMsg, setEventMessage] = useState("");
  const [eventDate, setEventDate] = useState("01/01/2024");
  const [showCountdown, setShowCountdown] = useState(false);

  const convertDate = (str) => {
    const dateString = str;
    const [day, month, year] = dateString.split("/");
    const convertedDate = `${year}-${month}-${day}`;

    return convertedDate;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.mcchstfuntua.edu.ng/admin/application.php"
        );

        const basicDetails = response.data.details;

        const targetOpeningDate =
          convertDate(basicDetails.ApplicationOpening) + "T23:59:59+01:00";
        const targetClosingDate =
          basicDetails.ApplicationClosing + "T23:59:59+01:00";

        setApplicationOpeningDate(targetOpeningDate);
        setApplicationClosingDate(targetClosingDate);
        setEventMessage(basicDetails.EventMessage);
        if (basicDetails.EventStatus === "Open") {
          setShowCountdown(true);
        }
      } catch (error) {
        // Handle errors
      }
    };

    fetchData();
  }, []);

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

        <div style={{ color: "white", fontWeight: 900 }}>welcome to</div>
        <h1 style={{ fontSize: "3vw" }}>
          <span style={{ fontStyle: "italic", color: "#f5e559" }}>
            Muslim Community
          </span>
          <br />
          <span style={{ color: "white" }}>
            College of Health Science and Technology Funtua
          </span>
        </h1>

        <div className="form-caption">APPLICATION PORTAL</div>

        <div className="text-container">
          <div>
            {eventMsg}
            {false && (
              <Countdown
                handleExpire={setIsExpired}
                targetDate={applicationOpeningDate}
              />
            )}
          </div>
          <br />
          {true && (
            <div className="button-container">
              <Button
                label="Get Started"
                handleClick={() => {
                  navigate("/varify-email");
                }}
              />
            </div>
          )}
          <br /> <br />
          <br /> <br />
          <p>For inquiries and more information, please contact us at:</p>
          <address>
            Email: info@mcchstfuntua.edu.ng
            <br />
            Phone: +234 7035436772, +234 8027261145
            <br />
            Address: P.O Box 8 Behind Genaral Hospital, Sokoto Road Funtua,
            Katsina State.
          </address>
        </div>
      </div>
    </div>
  );
};
