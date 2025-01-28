import React from "react";
import logo from "../../pictures/logo.png";
import { useNavigate } from "react-router-dom";

const ContactUs = () => {
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
          width: "85%",
          margin: "20px auto",
          padding: "20px",
          backgroundColor: "#fff",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2>Contact Us</h2>
        <p>For inquiries and more information, please contact us at:</p>
        <address>
          Email: info@mcchstfuntua.edu.ng
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

export default ContactUs;
