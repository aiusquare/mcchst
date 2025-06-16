import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toast } from "../errorNotifier";
import logo from "../../pictures/logo.png";
import axios from "axios";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";

const ApplicantProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = location.state?.userEmail;

  const [noteToApplicant, setNoteToApplicant] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.post(
          "https://api.mcchstfuntua.edu.ng/applicant_profile.php",
          { email: userEmail },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data) {
          setStudentDetails(response.data);
          setNoteToApplicant(
            response.data.screening_info?.NoteToApplicant || "No note available"
          );
        }
      } catch (err) {
        console.error("Error fetching data:", err);

        Toast.fire({
          icon: "error",
          title: err.response?.data?.message || "An error occurred",
        });
      }
    };

    fetchData();
  }, [userEmail, navigate]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const metaTag = document.querySelector('meta[name="viewport"]');
    const originalContent = metaTag.getAttribute("content");

    metaTag.setAttribute("content", "width=1024");

    return () => {
      metaTag.setAttribute("content", originalContent);
    };
  }, []);

  return (
    <div>
      {studentDetails ? (
        <div>
          {/* Header */}
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
              onClick={() => navigate("/")}
            />
            <h1 style={{ fontSize: "3vw" }}>
              <span style={{ fontStyle: "italic", color: "#f5e559" }}>
                Muslim Community
              </span>{" "}
              <br />
              College of Health Science and Technology Funtua
            </h1>
          </header>

          {/* Application Form */}
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
            <h2
              style={{ textAlign: "center", padding: "20px", fontWeight: 800 }}
            >
              Application Form
            </h2>

            {/* Note */}
            <div style={{ fontWeight: 800, color: "red" }}>Note:</div>
            <p style={{ fontWeight: 800, fontSize: "12px" }}>
              {noteToApplicant}
            </p>

            {/* Application Details */}
            <MDBRow>
              <MDBCol>
                <i>Application No: </i>
                <b>{studentDetails.application.ApplicationId}</b>
              </MDBCol>
              <MDBCol>
                <i>Mode of Entry: </i>
                <b>{studentDetails.application.ModeOfEntry}</b>
              </MDBCol>
              <MDBCol>
                <i>Date: </i>
                <b>{studentDetails.application.reg_date}</b>
              </MDBCol>
            </MDBRow>

            {/* Basic Details */}
            <div style={{ fontWeight: 700, marginTop: "20px" }}>
              Basic Details
            </div>
            <table border={0.2}>
              <tbody>
                <tr>
                  <td>
                    <b>First Name</b>
                  </td>
                  <td>{studentDetails.application.FirstName}</td>
                </tr>
                <tr>
                  <td>
                    <b>Surname</b>
                  </td>
                  <td>{studentDetails.application.Surname}</td>
                </tr>
                <tr>
                  <td>
                    <b>Other Name</b>
                  </td>
                  <td>{studentDetails.application.OtherName}</td>
                </tr>
                <tr>
                  <td>
                    <b>Phone Number</b>
                  </td>
                  <td>{studentDetails.application.PhoneNumber}</td>
                </tr>
                <tr>
                  <td>
                    <b>Email Address</b>
                  </td>
                  <td>{studentDetails.application.Email}</td>
                </tr>
                <tr>
                  <td>
                    <b>Address</b>
                  </td>
                  <td>{studentDetails.application.Address}</td>
                </tr>
                <tr>
                  <td>
                    <b>Marital Status</b>
                  </td>
                  <td>{studentDetails.application.MaritalStatus}</td>
                  <td>
                    <b>Gender</b>
                  </td>
                  <td>{studentDetails.application.Gender}</td>
                </tr>
                <tr>
                  <td>
                    <b>State</b>
                  </td>
                  <td>{studentDetails.application.State}</td>
                  <td>
                    <b>LGA</b>
                  </td>
                  <td>{studentDetails.application.LGA}</td>
                </tr>
                <tr>
                  <td>
                    <b>Date of Birth</b>
                  </td>
                  <td>{studentDetails.application.DoB}</td>
                </tr>
              </tbody>
            </table>

            {/* Course Details */}
            <div style={{ fontWeight: 700, marginTop: "20px" }}>
              Course Details
            </div>
            <table border={0.2}>
              <tbody>
                <tr>
                  <td>First Choice Programme</td>
                  <td>{studentDetails.course_details.FirstChoiceProgramme}</td>
                </tr>
                <tr>
                  <td>Second Choice Programme</td>
                  <td>{studentDetails.course_details.SecondChoiceProgramme}</td>
                </tr>
                <tr>
                  <td>Jamb Number</td>
                  <td>{studentDetails.course_details.JambNumber}</td>
                </tr>
                <tr>
                  <td>Jamb Score</td>
                  <td>{studentDetails.course_details.JambScore}</td>
                </tr>
              </tbody>
            </table>

            {/* Educational Details */}
            <div style={{ fontWeight: 700, marginTop: "20px" }}>
              Educational Details
            </div>
            <table border={0.2}>
              <tbody>
                <tr>
                  <td>Primary School</td>
                  <td>{studentDetails.educational_details.PrimarySchool}</td>
                  <td>{studentDetails.educational_details.PrimaryYear}</td>
                </tr>
                <tr>
                  <td>Secondary School</td>
                  <td>{studentDetails.educational_details.SecondarySchool}</td>
                  <td>{studentDetails.educational_details.SecondaryYear}</td>
                </tr>
                <tr>
                  <td>Other School</td>
                  <td>{studentDetails.educational_details.Tertiary}</td>
                  <td>{studentDetails.educational_details.TertiaryYear}</td>
                </tr>
                <tr>
                  <td>Highest Qualification</td>
                  <td>
                    {studentDetails.educational_details.HighestQualification}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Print Button (Placed outside for better UI) */}
          <div style={{ textAlign: "center", margin: "20px" }}>
            <button
              onClick={handlePrint}
              style={{
                padding: "10px 20px",
                backgroundColor: "#05321e",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Print
            </button>
          </div>
        </div>
      ) : (
        <p>Loading student details...</p>
      )}
    </div>
  );
};

export default ApplicantProfile;
