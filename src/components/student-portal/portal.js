import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MDBCol, MDBContainer, MDBRow } from "mdb-react-ui-kit";
import Atm from "../atm.js";
import StudentProfile from "./student-profile.js";

function StudentPortal(props) {
  let navigate = useNavigate();
  let location = useLocation();
  const [fund, setFund] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    if (!location.state || !location.state.userData) {
      navigate("/login");
    } else {
      console.log("THE DATA", location.state.userData);
      const isDataValidated = location.state.userData.Validated;

      if (isDataValidated !== "yes") {
        const applicationId = location.state.userData.ApplicationId;
        if (applicationId.startsWith("MCCHST2023")) {
          navigate("/csv-update", {
            state: {
              userData: location.state.userData,
            },
          });
        } else {
          navigate("/validation");
        }
      } else {
        setUserEmail(location.state.userData.Email);
        setUserData(location.state.userData);
      }
    }
  });

  return (
    <div>
      {fund && <Atm showMe={true} fund={setFund} />}
      {!fund && (
        <MDBContainer className="d-flex flex-column align-items-center justify-content-center w-100">
          <MDBRow className="w-100">
            <MDBCol>
              <StudentProfile userData={userData} />
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      )}
    </div>
  );
}

export default StudentPortal;
