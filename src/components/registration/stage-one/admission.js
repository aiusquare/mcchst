import React, { useEffect, useState } from "react";

import logo from "../../../pictures/logo.png";
import "./admission.css";
import { useLocation, useNavigate } from "react-router-dom";
// import { usePaystackPayment } from "react-paystack";
import { Button } from "../../button";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import request from "superagent";
import Swal from "sweetalert2";
import { loader } from "../../LoadingSpinner";
import { Toast } from "../../errorNotifier";

export const AdmissionComponent = () => {
  const [nav, setNav] = useState("welcome");

  return (
    <div className="admission">
      {nav === "welcome" && <WelcomeMessage setNav={setNav} />}
      {nav === "notification" && <NotificationOfAdmission />}
      {nav === "admission" && <Admission />}
    </div>
  );
};

const WelcomeMessage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applicantName, setApplicantName] = useState("");

  useEffect(() => {
    setApplicantName(location.state.userData.FirstName);
  });
  return (
    <>
      <h1>
        <b>Congratulations</b>
      </h1>
      <div className="text-container">
        <span style={{ float: "left" }}>
          <b>Dear {applicantName};</b>
        </span>
        <br />
        We are thrilled to welcome you to Muslim Community College of Health
        Sceince and Techchnology Funtua. Please always remember our watch words
        - Discipline and Academic Excelence.
        <br /> <br />
        <b>Our College, Our Pride!</b>
        <br />
        <div className="button-container">
          <Button
            handleClick={() => {
              props.setNav("notification");
            }}
            className="button-instance"
            label="CONTINUE"
          />
        </div>
      </div>
    </>
  );
};

const NotificationOfAdmission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applicantName, setApplicantName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [date, setDate] = useState("");
  const [fullname, setFullname] = useState("");
  const [appNumber, setAppNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [programme, setProgramme] = useState("");
  const [modeOfEntry, setModeOfEntry] = useState("");
  const [level, setLevel] = useState("");
  const [lectureDate, setLectureDate] = useState("");

  // const handlePrint = async () => {
  //   const formData = {
  //     Email: "ahmadibrahimusmanmkk@gmail.com",
  //   };

  //   try {
  //     const response = await fetch(
  //       "http://api.mcchstfuntua.edu.ng/node/notification_of_admission",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(formData),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }

  //     const pdfBlob = await response.blob();
  //     const url = window.URL.createObjectURL(pdfBlob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "notification_of_admission.pdf";
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //   } catch (error) {
  //     console.error("Error fetching PDF:", error);
  //   }
  // };

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

  // const handlePrintNotifOfAdmission = async () => {
  //   if (!isReady) {
  //     Toast.fire({
  //       icon: "warning",
  //       title:
  //         "kindly wait for the data to load. Try again in a minute or check your internet connection",
  //     });
  //     return;
  //   }
  //   loader({ title: "Downloading", text: "please wait..." });

  //   try {
  //     const response = await fetch("/notif_of_admission.pdf");
  //     const existingPdfBytes = await response.arrayBuffer();
  //     const pdfDoc = await PDFDocument.load(existingPdfBytes);
  //     const form = pdfDoc.getForm();

  //     form.getTextField("date").setText(date);
  //     form.getTextField("fullname").setText(fullname);
  //     form.getTextField("applicationNumber").setText(appNumber);
  //     form.getTextField("dearName").setText(applicantName);
  //     form.getTextField("department").setText(department);
  //     form.getTextField("programmeOffered").setText(programme);
  //     form.getTextField("modeOfEntry").setText(modeOfEntry);
  //     form.getTextField("level").setText(level);
  //     form.getTextField("commencementOfLectures").setText(lectureDate);

  //     const pdfBytes = await pdfDoc.save();
  //     const blob = new Blob([pdfBytes], { type: "application/pdf" });
  //     saveAs(blob, "notification_of_admission.pdf");

  //     Swal.fire({
  //       title: "success",
  //       text: "downloaded successfully",
  //       icon: "success",
  //     });
  //   } catch (error) {
  //     console.error("Error processing PDF:", error);
  //     Swal.fire({
  //       title: "Error!",
  //       text: error,
  //       icon: "error",
  //     });
  //   }
  // };

  const handleFetchData = async () => {
    const data = {
      email: userEmail,
    };

    if (userEmail) {
      // This condition will check for non-empty, non-null, non-undefined values
      console.log("THE DATA", data);

      try {
        const response = await request
          .post("https://api.mcchstfuntua.edu.ng/admin/get_admitted_std.php")
          .type("application/json")
          .send(data);

        const basicDetails = response.body;

        if (basicDetails) {
          setDate(basicDetails.Date || "");
          setFullname(basicDetails.Fullname || "");
          setAppNumber(basicDetails.ApplicationNo || "");
          setDepartment(basicDetails.Department || "");
          setModeOfEntry(basicDetails.ModeOfEntry || "");
          setLevel(basicDetails.Level || "");
          setProgramme(basicDetails.Programme || "");
          setLectureDate(basicDetails.LectureComencement || "");

          setIsReady(true);
        } else {
          console.error("basicDetails is null or undefined");
        }
      } catch (err) {
        console.log("Error message:", err.response);
        console.log("ERROR", err);
      }
    }
  };

  useEffect(() => {
    if (location.state?.userData) {
      setApplicantName(location.state.userData.FirstName);
      setUserEmail(location.state.userData.Email);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isReady && userEmail) {
      handleFetchData();
    }
  }, [isReady, userEmail]);
  return (
    <>
      <h1>
        <b>Notification of Admission</b>
      </h1>
      <div className="text-container" style={{ textAlign: "center" }}>
        Please click the <b>Download</b> button below to download and print your
        Notification of Admission. After printing, you are required to report to
        the school for departmental screening by your Head of Department (HOD).
        <div className="button-container">
          <MDBRow>
            <MDBCol>
              <Button
                handleClick={() => {
                  handlePrintNotifOfAdmission();
                }}
                className="button-instance"
                label="Download"
              />
            </MDBCol>
            {/* <MDBCol>
              <Button
                handleClick={() => {
                  navigate("/acceptance", {
                    state: { userData: location.state.userData },
                  });
                }}
                className="button-instance"
                label="Pay now"
              />
            </MDBCol> */}
          </MDBRow>
        </div>
      </div>
    </>
  );
};

const Admission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applicantName, setApplicantName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [date, setDate] = useState("");
  const [fullname, setFullname] = useState("");
  const [appNumber, setAppNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [programme, setProgramme] = useState("");
  const [modeOfEntry, setModeOfEntry] = useState("");
  const [level, setLevel] = useState("");
  const [lectureDate, setLectureDate] = useState("");

  // const handlePrint = async () => {
  //   const formData = {
  //     Email: "ahmadibrahimusmanmkk@gmail.com",
  //   };

  //   try {
  //     const response = await fetch(
  //       "http://api.mcchstfuntua.edu.ng/node/notification_of_admission",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(formData),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }

  //     const pdfBlob = await response.blob();
  //     const url = window.URL.createObjectURL(pdfBlob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "notification_of_admission.pdf";
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //   } catch (error) {
  //     console.error("Error fetching PDF:", error);
  //   }
  // };

  const handlePrint = async () => {
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
      form.getTextField("fulname").setText(fullname);
      form.getTextField("applicationNumber").setText(appNumber);
      form.getTextField("dearName").setText(applicantName);
      form.getTextField("department").setText(department);
      form.getTextField("programmeOffered").setText(programme);
      form.getTextField("modeOfEntry").setText(modeOfEntry);
      form.getTextField("level").setText(level);
      form.getTextField("commencementOfLecture").setText("DATE HERE");
      // form.getTextField("level").setText(level);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "provisional_admission.pdf");

      Swal.fire({
        title: "success",
        text: "downloaded successfully",
        icon: "success",
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
      });
    }
  };

  const handleFetchData = async () => {
    const data = {
      email: userEmail,
    };
    await request
      .post("https://api.mcchstfuntua.edu.ng/admin/get_admitted_std.php")
      .type("application/json")
      .send(data)
      .then((response) => {
        const basicDetails = response.body;

        setDate(basicDetails.Date);
        setFullname(basicDetails.Fullname);
        setAppNumber(basicDetails.ApplicationNo);
        setDepartment(basicDetails.Department);
        setModeOfEntry(basicDetails.ModeOfEntry);
        setLevel(basicDetails.Level);
        setProgramme(basicDetails.Programme);
        setLectureDate(basicDetails.LectureComencement || "");

        setIsReady(true);
      })
      .catch((err) => {
        console.log("Error message:", err.response);
        console.log("ERROR", err);
      });
  };

  useEffect(() => {
    if (!isReady) {
      handleFetchData();
    }
  });

  useEffect(() => {
    setApplicantName(location.state.userData.FirstName);
    setUserEmail(location.state.userData.Email);
  });

  return (
    <>
      <h1>
        <b>Admission Dowload</b>
      </h1>
      <div className="text-container" style={{ textAlign: "center" }}>
        <br />
        Please click <b>Download</b> button below to download and print your
        Provisional Admission. You can continue by clicking on CONTINUE button
        if you already downloaded the admission letter.
        <div className="button-container">
          <MDBRow>
            <MDBCol>
              <Button
                handleClick={() => {
                  handlePrint();
                }}
                className="button-instance"
                label="Download"
              />
            </MDBCol>
            <MDBCol>
              <Button
                handleClick={() => {
                  navigate("/portal", {
                    state: { userData: location.state.userData },
                  });
                }}
                className="button-instance"
                label="Continue"
              />
            </MDBCol>
          </MDBRow>
        </div>
      </div>
    </>
  );
};
