import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toast } from "../errorNotifier";
import logo from "../../pictures/logo.png";
import axios from "axios";

const StudentProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [noteToApplicant, setNoteToApplicant] = useState("");

  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    if (location.state && location.state.userEmail) {
      const userEmail = location.state && location.state.userEmail;
      const fetchData = async () => {
        try {
          const response = await axios.post(
            "https://api.mcchstfuntua.edu.ng/applicant_profile.php",
            {
              email: userEmail,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          setStudentDetails(response.data);
          setNoteToApplicant(response.data.screening_info.NoteToApplicant);
        } catch (err) {
          console.error("Error message:", err.response);
          console.error("ERROR", err);

          Toast.fire({
            icon: "error",
            title: err.message, // Display the error message instead of the entire error object
          });
        }
      };

      fetchData();
    } else {
      navigate("/login");
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    // Set the viewport width to 1024 when the component mounts
    const metaTag = document.querySelector('meta[name="viewport"]');
    metaTag.setAttribute("content", "width=1024");

    // Clean up the effect when the component unmounts
    return () => {
      // Restore the original viewport settings
      metaTag.setAttribute("content", "width=device-width, initial-scale=1");
    };
  }, []);

  return (
    <div>
      {studentDetails ? (
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
            <h2
              style={{ textAlign: "center", padding: "20px", fontWeight: 800 }}
            >
              Student Data
            </h2>

            {/* <div style={{ fontWeight: 800, color: "red" }}>Note:</div>
            <p style={{ fontWeight: 800, fontSize: "12px" }}>
              {noteToApplicant}
            </p> */}

            <div style={{ position: "relative", width: "100%" }}>
              <div style={{ right: "5px", float: "right" }}>
                <i>Registered on: </i>
                <b>{studentDetails.application.reg_date}</b>
              </div>

              <div style={{ left: "5px", float: "left" }}>
                <i>Application No: </i>
                <b>{studentDetails.application.ApplicationId}</b>
              </div>
            </div>

            <div style={{ clear: "both", fontWeight: 700 }}>Basic Details</div>

            <table border={0.2}>
              <tr>
                <td>
                  <b>First Name</b>
                </td>
                <td>{studentDetails.application.FirstName} </td>
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
                <td>{studentDetails.application.OtherName} </td>
              </tr>
              <tr>
                <td>
                  <b>Phone Number</b>
                </td>
                <td>{studentDetails.application.PhoneNumber} </td>
              </tr>
              <tr>
                <td>
                  <b>Email Address</b>
                </td>
                <td>{studentDetails.application.Email} </td>
              </tr>
              <tr>
                <td>
                  <b>Address</b>
                </td>
                <td>{studentDetails.application.Address}</td>
              </tr>
              <tr>
                <td>
                  <b>Marital Status</b>|
                  {studentDetails.application.MaritalStatus}
                </td>

                <td>
                  <b>Gender</b> | {studentDetails.application.Gender}
                </td>
              </tr>
              <tr>
                <td>
                  <b>State</b> | {studentDetails.application.State}
                </td>

                <td>
                  <b>LGA</b> | {studentDetails.application.LGA}
                </td>
              </tr>
              <tr>
                <td>
                  <b>Date of Birth</b>
                </td>

                <td>{studentDetails.application.DoB}</td>
              </tr>
            </table>

            <div style={{ fontWeight: 700, marginTop: "20px" }}>
              Course Details
            </div>
            <table border={0.2}>
              <tr>
                <td>First Choice Programme</td>
                <td>{studentDetails.course_details.FirstChoiceProgramme} </td>
              </tr>
              <tr>
                <td>Second Choice Programme</td>
                <td>{studentDetails.course_details.SecondChoiceProgramme} </td>
              </tr>
              <tr>
                <td>Jamb Number</td>
                <td>{studentDetails.course_details.JambNumber} </td>
              </tr>
              <tr>
                <td>Jamb Score</td>
                <td>{studentDetails.course_details.JambScore} </td>
              </tr>
            </table>

            <div style={{ fontWeight: 700, marginTop: "20px" }}>
              Educational Details
            </div>
            <table border={0.2}>
              <tr>
                <td>Primary School</td>
                <td>{studentDetails.educational_details.PrimarySchool} </td>
                <td>{studentDetails.educational_details.PrimaryYear}</td>
              </tr>
              <tr>
                <td>Secondary School</td>
                <td>{studentDetails.educational_details.SecondarySchool} </td>
                <td>{studentDetails.educational_details.SecondaryYear}</td>
              </tr>
              <tr>
                <td>Other School</td>
                <td>{studentDetails.educational_details.Tertiary} </td>
                <td>{studentDetails.educational_details.TertiaryYear}</td>
              </tr>
              <tr>
                <td>Highest Qualification</td>
                <td>
                  {studentDetails.educational_details.HighestQualification}{" "}
                </td>
                <td></td>
              </tr>
            </table>

            <div style={{ fontWeight: 700, marginTop: "20px" }}>
              Other Details
            </div>
            <table border={0.2}>
              <tr>
                <td>Parent/Guardian Name</td>
                <td>{studentDetails.other_details.ParentOrGuardianName}</td>
              </tr>
              <tr>
                <td>Parent/Guardian Address</td>
                <td>{studentDetails.other_details.ParentOrGuardianAddress}</td>
              </tr>
              <tr>
                <td>Parent/Guardian Phone Number</td>
                <td>{studentDetails.other_details.ParentOrGuardianPhone} </td>
              </tr>
              <tr>
                <td>Parent/Guardian Email</td>
                <td>{studentDetails.other_details.ParentOrGuardianEmail} </td>
              </tr>
            </table>
          </section>
          {/* <button onClick={handlePrint}>Print</button> */}
        </div>
      ) : (
        <p>Loading student details...</p>
      )}
    </div>
  );
};

export default StudentProfile;
