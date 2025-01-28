import React from "react";
import logo from "../../pictures/logo.png";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();
  return (
    <div>
      <header
        style={{
          backgroundColor: "#05321e",
          color: "#fff",
          textAlign: "center",
          padding: "10px",
        }}
      >
        <img
          style={{ width: "100px", height: "100px", cursor: "pointer" }}
          src={logo}
          alt="logo"
          onClick={() => {
            navigate("/");
          }}
        />
        <h1 style={{ fontSize: "3vw" }}>
          <span style={{ fontStyle: "italic", color: "#f5e559" }}>
            Muslim Community{" "}
          </span>
          <br />
          College of Health Science and Technology Funtua
        </h1>
      </header>

      <section
        style={{
          width: "80%",
          margin: "20px auto",
          padding: "20px",
          backgroundColor: "#fff",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          textAlign: "left",
        }}
      >
        <h2>About Us</h2>
        <p>
          The Muslim Community College of Health Sciences and Technology Funtua
          was founded by the Muslim Students Society of Nigeria (MSSN), Funtua
          Area Council in 1999 as an affiliate to the Islamic Foundation School
          of Health Technology, Kaduna. It is an upgrade of the Nursing
          Auxiliary Training Programme earlier started and run by the MSSN.
        </p>

        <h2>Vision</h2>
        <p>
          To create a center of academic excellence that contributes to national
          development through training, research, and manpower development.
        </p>

        <h2>Mission</h2>
        <p>
          To contribute to the upliftment of Primary and Secondary Healthcare
          System through development of manpower, which is qualitative, God
          Conscious and positively responsive to community health needs
          anywhere, anytime.
        </p>

        <h2>Objectives of the College</h2>
        <ol>
          <li>
            To produce highly disciplined, hardworking and God-conscious Health
            Workers that can address the healthcare needs of the society.
          </li>
          <li>
            To encourage research activities in health and social welfare aspect
            of the community for national growth and development.
          </li>
          <li>
            To encourage community participation and involvement in the areas of
            self-help projects in order to compliment government’s effort in the
            provision of healthcare services for Nigerian citizens.
          </li>
          <li>
            To prepare students for further studies in other tertiary
            institutions of learning.
          </li>
          <li>
            To foster national unity by bringing students from different parts
            of the country irrespective of their tribe, place of origin, and
            religion to live and study together in the College.
          </li>
        </ol>

        <h2>Contact Us</h2>
        <p>For inquiries and more information, please contact us at:</p>
        <address>
          Email: info@mcchst.edu.ng
          <br />
          Phone: +234 7035436772, +234 8027261145
          <br />
          Address: P.O Box 8 Behind Genaral Hospital, Sokoto Road Funtua,
          Katsina State.
        </address>
      </section>
    </div>
  );
};

export default AboutUs;
