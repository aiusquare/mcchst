import { React, useState } from "react";
import { MDBIcon } from "mdb-react-ui-kit";
import "../css/style.css";
import "firebase/compat/storage";
import { firebase } from "../services/config";
import "firebase/compat/database";

const db = firebase.database();

export default function UserProfile(props) {
  const [userName, setUserName] = useState("Ahmad Usman");
  const [address, setAddress] = useState("Faskari road, Funtua");
  const [email, setEmail] = useState("aiu@gmail.com");
  const [phoneNumber, setPhoneNumber] = useState("09016609192");
  const userEmail = props.userEmail;

  // connectivity check
  if (navigator.onLine) {
    fetch("https://www.google.com/", { mode: "no-cors" }).then(() => {
      const tref = db.ref("/users").on("value", function (snap) {
        try {
          snap.forEach((child) => {
            let fetchedEmail = child.val().email;

            if (fetchedEmail === userEmail) {
              props.userRefrence(child.key);
              setUserName(
                child.val().firstName +
                  " " +
                  child.val().surname +
                  " " +
                  child.val().otherName
              );
              setAddress(child.val().address);
              setEmail(child.val().email);
              setPhoneNumber(child.val().phoneNumber);
            }
          });
        } catch (e) {
          console.log(e);
        }
      });
    });
  }

  return (
    <div style={{ overflow: "hidden" }}>
      <div className="profile-label">
        <h3>User profile</h3>
        <img id="user-image" />
      </div>

      <div className="profile-bg">
        <MDBIcon className="icn" fas icon="user" />
        <div className="title">User name</div>
        <div className="desc">{userName}</div>
      </div>

      <div className="profile-bg">
        <MDBIcon className="icn" fas icon="map-marked-alt" />
        <div className="title">Address</div>
        <div className="desc">{address}</div>
      </div>

      <div className="profile-bg">
        <MDBIcon className="icn" fas icon="at" />
        <div className="title">Email</div>
        <div className="desc">{email}</div>
      </div>

      <div className="profile-bg">
        <MDBIcon className="icn" fas icon="phone" />
        <div className="title">Phone number</div>
        <div className="desc">{phoneNumber}</div>
      </div>
    </div>
  );
}
