import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { MDBBtn, MDBCol, MDBIcon, MDBRow } from "mdb-react-ui-kit";
import request from "superagent";
import Swal from "sweetalert2";
import { Toast } from "../errorNotifier.js";
import { loader } from "../LoadingSpinner.js";
import axios from "axios";

const RegistrationDownloadsCard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [applicantName, setApplicantName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [testScore, setTestScore] = useState("");
  const [date, setDate] = useState("");
  const [fullname, setFullname] = useState("");
  const [matNumber, setMatNumber] = useState("");
  const [appNumber, setAppNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [programme, setProgramme] = useState("");
  const [programmeCode, setProgrammeCode] = useState("");
  const [modeOfEntry, setModeOfEntry] = useState("");
  const [sessionOfEntry, setSessionOfEntry] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [commencementOfLectures, setCommencementOfLectures] = useState("");
  const [registrationClousure, setRegistrationClousure] = useState("");

  const handlePrintAdmission = async () => {
    if (!isReady) {
      Toast.fire({
        icon: "warning",
        title:
          "kindly wait for the data to load. Try again in a minute or check your internet connection",
      });
      return;
    }
    loader({ title: "Downloading", text: "please wait..." });

    try {
      const response = await fetch("/provisional_admission.pdf");
      const existingPdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();

      form.getTextField("date").setText(date);
      form.getTextField("name").setText(fullname);
      form.getTextField("applicationNumber").setText(appNumber);
      form.getTextField("dearName").setText(applicantName);
      form.getTextField("department").setText(department);
      form.getTextField("programme").setText(programme);
      form.getTextField("duration").setText(duration);
      form.getTextField("level").setText(level);
      form
        .getTextField("commencementOfLectures")
        .setText(commencementOfLectures);
      form.getTextField("registrationClosure").setText(registrationClousure);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "provisional_admission.pdf");

      Swal.fire({
        title: "success",
        text: "downloaded successfully",
        icon: "success",
      });
    } catch (error) {
      // console.error("Error processing PDF:", error);
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
      });
    }
  };

  const handlePrintCourseRegistration = async () => {
    if (!isReady) {
      Toast.fire({
        icon: "warning",
        title:
          "kindly wait for the data to load. Try again in a minute or check your internet connection",
      });
      return;
    }

    if (!matNumber) {
      Swal.fire({
        icon: "info",
        title: "Matric Number Missing",
        text: "You need to get Admission number first before downloading this form. Please goto registry to complete your registration.",
      });
      return;
    }

    loader({ title: "Downloading", text: "please wait..." });

    const fetchData = async () => {
      try {
        const res = await axios.post(
          "https://api.mcchstfuntua.edu.ng/admin/get_course_registration.php",
          {
            email: userEmail,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // console.log("COURSE REG", res.data);

        const retData = res.data;
        // console.log("THE DATA", retData);
        try {
          const response = await fetch("/course_registration.pdf");
          const existingPdfBytes = await response.arrayBuffer();
          const pdfDoc = await PDFDocument.load(existingPdfBytes);
          const form = pdfDoc.getForm();

          form.getTextField("name").setText(fullname);
          form.getTextField("regNo").setText(matNumber);
          form.getTextField("session").setText(sessionOfEntry);
          form.getTextField("department").setText(department);
          form.getTextField("programme").setText(programmeCode);

          let firstSemIndex = 1;
          let secondSemIndex = 1;
          let fsTcu = 0;
          let ssTcu = 0;

          retData.forEach((course) => {
            if (course.Semester === "1st") {
              form
                .getTextField(`fsSN${firstSemIndex}`)
                .setText("" + firstSemIndex);
              form.getTextField(`fsCode${firstSemIndex}`).setText(course.Code);
              form
                .getTextField(`fsCouresTitle${firstSemIndex}`)
                .setText(course.CourseTitle);
              form
                .getTextField(`fsUnit${firstSemIndex}`)
                .setText("" + course.Unit);

              fsTcu += course.Unit;
              firstSemIndex++;
            }

            if (course.Semester === "2nd") {
              form
                .getTextField(`ssSN${secondSemIndex}`)
                .setText("" + secondSemIndex);
              form.getTextField(`ssCode${secondSemIndex}`).setText(course.Code);
              form
                .getTextField(`ssCouresTitle${secondSemIndex}`)
                .setText(course.CourseTitle);
              form
                .getTextField(`ssUnit${secondSemIndex}`)
                .setText("" + course.Unit);

              ssTcu += course.Unit;
              secondSemIndex++;
            }
          });

          form.getTextField("fsTcu").setText("" + fsTcu);
          form.getTextField("ssTcu").setText("" + ssTcu);

          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          saveAs(blob, "course_registration.pdf");

          Swal.fire({
            title: "success",
            text: "downloaded successfully",
            icon: "success",
          });
        } catch (error) {
          // console.error("Error processing PDF:", error);
          Swal.fire({
            title: "Error!",
            text: error,
            icon: "error",
          });
        }
      } catch (err) {
        // console.error("Error message:", err.response);
        // console.error("ERROR", err);

        Toast.fire({
          icon: "error",
          title: err.message, // Display the error message instead of the entire error object
        });
      }
    };

    fetchData();
  };

  const handlePrintNotifOfAdmission = async () => {
    if (!isReady) {
      Toast.fire({
        icon: "warning",
        title:
          "kindly wait for the data to load. Try again in a minute or check your internet connection",
      });
      return;
    }
    loader({ title: "Downloading", text: "please wait..." });

    try {
      const response = await fetch(
        "https://api.mcchstfuntua.edu.ng/resources/download/notif_of_admin.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ application_id: appNumber }),
        }
      );

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "notification_of_admission.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      Swal.fire({
        title: "success",
        text: "downloaded successfully",
        icon: "success",
      });
    } catch (error) {
      console.error("Download error:", error);

      // console.error("Error processing PDF:", error);
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
      });
    }
  };

  const handlePrintProfile = async () => {
    if (!isReady) {
      Toast.fire({
        icon: "warning",
        title:
          "kindly wait for the data to load. Try again in a minute or check your internet connection",
      });
      return;
    }

    if (!matNumber) {
      Swal.fire({
        title: "Matric Number Missing",
        text: "You need to get Admission number first before downloading this form. Please goto registry to complete your registration.",
        icon: "info",
      });
      return;
    }

    loader({ title: "Downloading", text: "please wait..." });

    const fetchData = async () => {
      try {
        const res = await axios.post(
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

        const retData = res.data;
        const basicDetail = retData.application;
        const coursesDetail = retData.course_details;
        const eduDetails = retData.educational_details;
        const otherDetails = retData.other_details;
        const admissionDetails = retData.admission;
        const ssceDetails = retData.ssce;

        // console.log("THE DATA", retData);

        const response = await fetch("/student_personal_record.pdf");
        const existingPdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        form
          .getTextField("fullname")
          .setText(
            basicDetail.FirstName +
              " " +
              basicDetail.Surname +
              " " +
              basicDetail.OtherName
          );
        form.getTextField("nin").setText(basicDetail.NIN);
        form.getTextField("bloodGroup").setText(basicDetail.BloodGroup);
        form.getTextField("gender").setText(basicDetail.Gender);
        form.getTextField("stateOfOrigin").setText(basicDetail.State);
        form.getTextField("lgaOfOrigin").setText(basicDetail.LGA);
        form.getTextField("stateOfResidence").setText(basicDetail.State);
        form.getTextField("lgaOfResidence").setText(basicDetail.LGA);
        form.getTextField("maritalStatus").setText(basicDetail.MaritalStatus);
        form.getTextField("modeOfEntry").setText(admissionDetails.ModeOfEntry);
        form.getTextField("sponsorship").setText(otherDetails.Sponsorship);
        form.getTextField("permanentHomeAddress").setText(basicDetail.Address);
        form.getTextField("contactAddress").setText(basicDetail.ContactAddress);
        form
          .getTextField("candidatePhoneNumber")
          .setText(basicDetail.PhoneNumber);
        form.getTextField("dob").setText(basicDetail.DoB);
        form
          .getTextField("gurdianName")
          .setText(otherDetails.ParentOrGuardianName);
        form
          .getTextField("gurdianAddress")
          .setText(otherDetails.ParentOrGuardianAddress);
        form
          .getTextField("gurdianPhoneNumber")
          .setText(otherDetails.ParentOrGuardianPhone);

        form
          .getTextField("nameOfSponsor")
          .setText(otherDetails.ParentOrGuardianName);
        form
          .getTextField("addressOfSponsor")
          .setText(otherDetails.ParentOrGuardianAddress);

        form.getTextField("matNumber").setText(matNumber);
        form.getTextField("appNumber").setText(basicDetail.ApplicationId);
        form.getTextField("testScore").setText("" + testScore);
        form.getTextField("roomNumber").setText(otherDetails.RoomNumber);
        form.getTextField("dateOfAdmission").setText(admissionDetails.Date);
        form.getTextField("department").setText(admissionDetails.Department);
        form.getTextField("programme").setText(admissionDetails.Programme);
        form.getTextField("sessionOfEntry").setText(sessionOfEntry);

        form
          .getTextField("accFullname")
          .setText(
            basicDetail.FirstName +
              " " +
              basicDetail.Surname +
              " " +
              basicDetail.OtherName
          );
        form
          .getTextField("gurdAccFullname")
          .setText(
            basicDetail.FirstName +
              " " +
              basicDetail.Surname +
              " " +
              basicDetail.OtherName
          );
        form.getTextField("accDepartment").setText(admissionDetails.Department);
        form.getTextField("accProgramme").setText(admissionDetails.Programme);
        form.getTextField("accSession").setText(sessionOfEntry);
        form.getTextField("accTxtSession").setText(sessionOfEntry);
        form.getTextField("accLevel").setText(admissionDetails.Level);
        form.getTextField("accContactNumber").setText(basicDetail.PhoneNumber);

        form
          .getTextField("accContactAddress")
          .setText(basicDetail.ContactAddress);

        form.getTextField("jambNumber").setText(coursesDetail.JambNumber);
        form.getTextField("jambYear").setText(coursesDetail.JambYear);
        form.getTextField("jambScore").setText(coursesDetail.JambScore);

        ssceDetails.slice(0, 9).forEach((result, index) => {
          form.getTextField(`ssSN${index + 1}`).setText("" + (index + 1));
          form.getTextField(`sub${index + 1}`).setText(result.Subject);
          form.getTextField(`scr${index + 1}`).setText(result.Grade);
        });

        // there is post secondry qualification
        //  the fields are
        // psqSN*, psqProgramme*, psqInstitute*, psqYear*, psqGrade* to be looped

        if (eduDetails.PrimarySchool) {
          form.getTextField("primary").setText(eduDetails.PrimarySchool);
          form.getTextField("primaryYear").setText(eduDetails.PrimaryYear);
          form.getTextField("scSN1").setText("01");
        }

        if (eduDetails.SecondarySchool) {
          form.getTextField("secondry").setText(eduDetails.SecondarySchool);
          form.getTextField("secondryYear").setText(eduDetails.SecondaryYear);
          form.getTextField("scSN2").setText("02");
        }

        if (eduDetails.Tertiary) {
          form.getTextField("tertiary").setText(eduDetails.Tertiary);
          form.getTextField("tertiaryYear").setText(eduDetails.TertiaryYear);
          form.getTextField("scSN3").setText("03");
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        saveAs(blob, "student_profile.pdf");

        Swal.fire({
          title: "success",
          text: "downloaded successfully",
          icon: "success",
        });
      } catch (err) {
        // console.error("Error message:", err.response);
        // console.error("ERROR", err);

        Toast.fire({
          icon: "error",
          title: err.message, // Display the error message instead of the entire error object
        });
      }
    };

    fetchData();
  };

  const handleFetchData = async () => {
    const data = {
      email: userEmail,
    };

    try {
      const response = await request
        .post("https://api.mcchstfuntua.edu.ng/admin/get_admitted_std.php")
        .type("application/json")
        .send(data);

      const basicDetails = response.body;

      // console.log("THE DATA", basicDetails);

      if (basicDetails) {
        setDate(basicDetails.Date || "");
        setFullname(basicDetails.Fullname || ""); // Default to an empty string if Fullname is missing
        setApplicantName(basicDetails.Fullname || "");
        setAppNumber(basicDetails.ApplicationNo || "");
        setMatNumber(basicDetails.MatricNumber || "");
        setDepartment(basicDetails.Department || "");
        setModeOfEntry(basicDetails.ModeOfEntry || "");
        setLevel(basicDetails.Level || "");
        setProgramme(basicDetails.Programme || "");
        setProgrammeCode(basicDetails.ProgrammeCode || "");
        setDuration(basicDetails.Duration || "");
        setCommencementOfLectures(basicDetails.LectureComencement || "");
        setRegistrationClousure(basicDetails.RegistrationClousure || "");
        setSessionOfEntry(basicDetails.SessionOfEntry || "");
        setTestScore(basicDetails.TestScore || "");

        setIsReady(true);
      } else {
        // console.error("Response body is null:", response.res);
      }
    } catch (err) {
      // console.error("Error fetching data:", err.response || err);
    }
  };

  const handleFetchCourseRegistration = async () => {
    const data = {
      email: userEmail,
    };

    try {
      const response = await request
        .post(
          "https://api.mcchstfuntua.edu.ng/admin/get_course_registration.php"
        )
        .type("application/json")
        .send(data);

      const details = response.body;

      // console.log("COURSE REGISTRATION", details);

      if (details) {
        setIsReady(true);
      } else {
        // console.error("Response body is null:", response.res);
      }
    } catch (err) {
      // console.error("Error fetching data:", err.response || err);
    }
  };

  useEffect(() => {
    if (!isReady) {
      handleFetchData();
    }
  });

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      navigate("/login");
    } else {
      setUserEmail(userEmail);
    }
  });

  return (
    <div>
      <MDBCol className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
        <div className="m-4"></div>
        <div className="reg-captions">Registration Documents</div>

        <MDBRow className="mb-2 w-100 h-100">
          <MDBCol className="text-center">
            <MDBBtn
              style={{ background: "#05321e" }}
              className="m-2 p-2 w-100 button"
              size="lg"
              onClick={handlePrintCourseRegistration}
            >
              <MDBIcon size="lg" className="me-2" fas icon="download" />
              Course Registration
            </MDBBtn>
          </MDBCol>
          <MDBCol>
            <MDBBtn
              style={{ background: "#05321e" }}
              className="m-2 p-2 w-100 button"
              size="lg"
              onClick={() => {
                navigate("/validation");
              }}
            >
              <MDBIcon size="lg" className="me-2" fas icon="pen-to-square" />
              Edit Profile
            </MDBBtn>
          </MDBCol>
        </MDBRow>
        <MDBRow className="w-100">
          <MDBCol>
            <MDBBtn
              style={{ background: "#05321e" }}
              onClick={handlePrintAdmission}
              className="m-2 p-2 w-100 button"
            >
              Download Admission
            </MDBBtn>
          </MDBCol>
          <MDBCol>
            <MDBBtn
              style={{ background: "#05321e" }}
              onClick={handlePrintNotifOfAdmission}
              className="m-2 p-2 w-100 button"
            >
              Notification of Admission
            </MDBBtn>
          </MDBCol>
          <MDBCol>
            <MDBBtn
              style={{ background: "#05321e" }}
              onClick={handlePrintProfile}
              className="m-2 p-2 w-100 button"
            >
              Download Profile
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </MDBCol>
    </div>
  );
};

export default RegistrationDownloadsCard;
