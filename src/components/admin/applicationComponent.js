import * as React from "react";
import Paper from "@mui/material/Paper";
import "../admin/css/style.css";
import {
  MDBBtn,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBRow,
} from "mdb-react-ui-kit";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { sessionOfEntry, entryMode } from "../Arrays.js";
import { useEffect } from "react";
import { useState } from "react";
import request from "superagent";
import DateInput from "../DateInput";
import { programmes } from "../Arrays.js";
// import { admissionProgrammes } from "../Arrays.js";
import { loader } from "../LoadingSpinner.js";
import Swal from "sweetalert2";
import { Toast } from "../errorNotifier.js";
import dayjs from "dayjs";
import { downloadExcel } from "react-export-table-to-excel";
import useResizeObserver from "../hooks/useResizeObserver.js";

export default function ApplicationComponent() {
  const [rows, setRows] = useState([]);
  const [containerRef, size] = useResizeObserver();
  const [init, setInit] = useState(false);
  const [applicationOpeningDate, setApplicationOpeningDate] =
    useState("01/01/2024");
  const [applicationClosingDate, setApplicationClosingDate] =
    useState("01/04/2024");

  const [applicationFees, setApplicationFees] = useState(0);
  const [schoolFees, setSchoolFees] = useState(0);
  const [acceptanceFee, setAcceptanceFee] = useState(0);

  const [eventMsg, setEventMessage] = useState("");
  const [eventDate, setEventDate] = useState("01/01/2024");
  const [eventStatus, setEventStatus] = useState("Open");
  const [noteToApplicant, setNoteToApplicant] = useState("");
  const [studentsIdCardData, setStudentsIdCardData] = useState([]);

  useEffect(() => {
    handleDataFetch();
  }, []);

  const handleDataFetch = async () => {
    try {
      const basicResponse = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/application.php",
      );
      const basicDetails = basicResponse.body.details;

      setApplicationFees(basicDetails.ApplicationFees);
      setAcceptanceFee(basicDetails.AcceptanceFee);
      setSchoolFees(basicDetails.SchoolFees);
      setApplicationOpeningDate(basicDetails.ApplicationOpening);
      setApplicationClosingDate(basicDetails.ApplicationClosing);
      setEventDate(basicDetails.EventDate);
      setEventMessage(basicDetails.EventMessage);
      setEventStatus(basicDetails.EventStatus);
      setNoteToApplicant(basicDetails.NoteToApplicant);

      const coursesResponse = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/courses_on_offer.php",
      );
      setRows(coursesResponse.body);

      const applResponse = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/get_applicants.php",
      );

      const regApplicantsList = applResponse.body?.application || [];

      let constrStudentsIDArray = regApplicantsList.map((e, i) => ({
        SN: i + 1,
        Name: `${e.FirstName} ${e.Surname} ${e.OtherName}`,
        Code: "",
        State: e.State,
        Gender: e.Gender,
        BloodGroup: "",
        Course: "",
        Mobile: e.PhoneNumber,
        DOB: e.DoB,
        Photo: "",
      }));

      setStudentsIdCardData(constrStudentsIDArray);

      setInit(true);
    } catch (err) {
      console.error("Error fetching data: ", err);
    }
  };

  const handleIdDownloadExcel = () => {
    const idHeader = [
      "SN",
      "Name",
      "Code",
      "State",
      "Gender",
      "Blood Group",
      "Course",
      "Mobile Number",
      "DOB",
      "Photo",
    ];

    downloadExcel({
      fileName: "Students ID card data",
      sheet: "Students ID Card",
      tablePayload: {
        header: idHeader,
        body: studentsIdCardData,
      },
    });
  };

  const handleManagerDownloadExcel = async () => {
    loader({ title: "Downloading", text: "please wait..." });

    if (navigator.onLine) {
      await request
        .get(
          "https://api.mcchstfuntua.edu.ng/admin/application/manager/index.php",
        )
        .then((applResponse) => {
          const regApplicantsList = applResponse.body || [];

          console.log("THE DATA", regApplicantsList);

          let constrManagerDataArray = regApplicantsList.map((e, i) => ({
            "Mat. No.": e.MatricNumber,
            "Application No.": e.ApplicationId,
            Name: `${e.FirstName} ${e.Surname} ${e.OtherName}`,
            Address: e.Address,
            Email: e.Email,
            Department: e.Department,
            ControlAccount: "",
            State: e.State,
            LGA: e.LGA,
            Level: e.Level,
            Session: e.SessionOfEntry,
            Gender: e.Gender,
            Religion: "",
            MaritalStatus: e.MaritalStatus,
            Programme: e.Programme,
            StudentMobile: e.PhoneNumber,
            ParentMobile: e.ParentOrGuardianPhone,
            DOB: e.DoB,
          }));

          const managerHeader = [
            "Mat.No.",
            "Application No.",
            "Name",
            "Address",
            "Email",
            "Department",
            "ControlAccount",
            "State",
            "LGA",
            "Level",
            "Session",
            "Gender",
            "Religion",
            "Marital Status",
            "Programme",
            "Student Mobile Number",
            "Parent Mobile Number",
            "Date of Birth",
          ];

          downloadExcel({
            fileName: "Manager data",
            sheet: "Manager data",
            tablePayload: {
              header: managerHeader,
              body: constrManagerDataArray,
            },
          });

          Toast.fire({
            icon: "success",
            title: "Downloaded successfully",
          });
        });
    } else {
      Toast.fire({
        icon: "error",
        title: "No internet connection",
      });
    }
  };

  const handleCBTDownloadExcel = async () => {
    loader({
      title: "Downloading",
      text: "Please wait...",
    });

    if (!navigator.onLine) {
      Toast.fire({
        icon: "error",
        title: "No internet connection",
      });
      return;
    }

    try {
      const cbtResponse = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/application/cbt/index.php",
      );

      const rows = cbtResponse.body.data || [];

      const constrCBTDataArray = rows.map((e, i) => ({
        SNO: i + 1,
        "Serial No.": e.ApplicationId || "",
        Fullname:
          `${e.FirstName || ""} ${e.Surname || ""} ${e.OtherName || ""}`.trim(),
        Gender: e.Gender || "",
        "State of Origin": e.State || "",
        "LGA of Origin": e.LGA || "",
        "Date of Birth": e.DoB || "",
        Email: e.Email || "",

        // Preserve leading zeros in Excel
        "Phone number": `="${e.PhoneNumber || ""}"`,

        "Matric Number": e.MatricNumber || "",
        Department: e.Department || "",
        Programme: e.Programme || "",

        "Mode of Entry": "Fresh",

        "First Choice": e.FirstChoiceProgramme || "",
        "Second Choice": e.SecondChoiceProgramme || "",

        OLevel1: e.Scores || "",
        OLevel2: e.Scores || "",
      }));

      const cbtHeader = [
        "SNO",
        "Serial No.",
        "Fullname",
        "Gender",
        "State of Origin",
        "LGA of Origin",
        "Date of Birth",
        "Email",
        "Phone number",
        "Matric Number",
        "Department",
        "Programme",
        "Mode of Entry",
        "First Choice",
        "Second Choice",
        "OLevel1",
        "OLevel2",
      ];

      downloadExcel({
        fileName: `CBT_Data_${new Date().toISOString().split("T")[0]}`,
        sheet: "CBT Data",
        tablePayload: {
          header: cbtHeader,
          body: constrCBTDataArray,
        },
      });

      Toast.fire({
        icon: "success",
        title: `Downloaded ${rows.length} records successfully`,
      });
    } catch (err) {
      console.error("Download Error:", err);

      Toast.fire({
        icon: "error",
        title: "Failed to download data. Please try again.",
      });
    }
  };

  const saveBasicData = async () => {
    const data = {
      ApplicationOpening: applicationOpeningDate,
      ApplicationClosing: applicationClosingDate,
      AdmissionOpening: "01/04/2024",
      AdmissionClosing: "01/03/2024",
      ApplicationFees: applicationFees,
      SchoolFees: schoolFees,
      AcceptanceFee: acceptanceFee,
      EventMessage: eventMsg,
      EventStatus: eventStatus,
      EventDate: eventDate,
      NoteToApplicant: noteToApplicant,
    };

    if (navigator.onLine) {
      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/save_setup.php")
        .type("application/json")
        .send(data)
        .then((response) => {
          Toast.fire({
            icon: "success",
            title: "updated successfully",
          });
        })
        .catch((err) => {
          let errorText = err.response.text;
          // console.log(errorText);

          Swal.fire({
            title: "Error!",
            text: "There is occoured an error",
            icon: "error",
          });
        });
    } else {
      Toast.fire({
        icon: "error",
        title: "No internet connection",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="m-4 d-flex flex-column align-items-center"
    >
      <MDBCardBody>
        <MDBCardText>
          <h4>Students Application Management</h4>
        </MDBCardText>
      </MDBCardBody>
      <Paper className="p-2 w-100">
        {/* <MDBRow> */}
        <div style={{ fontWeight: "900", padding: "20px" }}>
          APPLICATION SETUP
        </div>
        <MDBRow>
          <MDBCol>
            <div>Event Message</div>
            <TextField
              value={eventMsg}
              className="center-cmp w-100"
              variant="outlined"
              multiline
              onChange={(e) => {
                setEventMessage(e.target.value);
              }}
            />
          </MDBCol>

          <MDBCol>
            <div>Set note to Applicant</div>
            <TextField
              value={noteToApplicant}
              className="center-cmp w-100"
              variant="outlined"
              multiline
              onChange={(e) => {
                setNoteToApplicant(e.target.value);
              }}
            />
          </MDBCol>
        </MDBRow>
        {/* </MDBRow> */}

        <MDBRow>
          <MDBRow></MDBRow>
          <div onClick={saveBasicData} className="cus-button w-25 my-2">
            Update
          </div>
        </MDBRow>
      </Paper>

      <Paper className="p-2 w-100 my-2">
        <MDBRow>
          <div style={{ fontWeight: "900", padding: "20px" }}>
            APPLICANTS DATA DOWNLOADS
          </div>
          <MDBRow>
            <MDBCol md={4}>
              <MDBBtn
                onClick={handleManagerDownloadExcel}
                style={{ background: "#05321e" }}
                className="m-btn-color"
              >
                Download for manager
              </MDBBtn>
            </MDBCol>
            <MDBCol md={4}>
              <MDBBtn
                onClick={handleCBTDownloadExcel}
                style={{ background: "#05321e" }}
              >
                Download for CBT
              </MDBBtn>
            </MDBCol>
            <MDBCol md={4}>
              <MDBBtn
                onClick={handleIdDownloadExcel}
                style={{ background: "#05321e" }}
              >
                Students ID Card
              </MDBBtn>
            </MDBCol>
          </MDBRow>
        </MDBRow>
      </Paper>

      <Paper className="p-2 w-100">
        <CoursesOnOffer
          programmes={programmes}
          sessionOfEntry={sessionOfEntry}
          entryMode={entryMode}
          rows={rows}
        />
      </Paper>
    </div>
  );
}

const CoursesOnOffer = ({ programmes, entryMode, sessionOfEntry }) => {
  const [courses, setCourses] = useState(programmes?.[0]?.programs || []);
  const [programme, setProgramme] = useState(programmes?.[0]?.name || []);
  const [course, setCourse] = useState("");
  const [rows, setRows] = useState([]);
  const [session, setSession] = useState("");
  const [eMode, setEMode] = useState("");

  useEffect(() => {
    if (programmes?.length) {
      setCourses(programmes[0].programs || []);
      setProgramme(programmes[0].name || "");
    }
    handleDataFetch();
  }, [programmes]);

  const handleDataFetch = async () => {
    try {
      const coursesResponse = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/courses_on_offer.php",
      );
      setRows(coursesResponse.body || []);
    } catch (err) {
      console.error("Error fetching data: ", err);
    }
  };

  if (!programmes || programmes.length === 0) {
    return <div>Loading...</div>; // Fallback UI while data is unavailable
  }

  const saveCoursesOnOffer = async () => {
    if (navigator.onLine) {
      loader({
        title: "Updating",
        text: "Please wait.",
      });

      try {
        await request
          .post(
            "https://api.mcchstfuntua.edu.ng/admin/save_courses_on_offer.php",
          )
          .type("application/json")
          .send(rows);

        Toast.fire({
          icon: "success",
          title: "Updated successfully",
        });
      } catch (err) {
        Swal.fire({
          title: "Error!",
          text: "An error occurred. Please try again.",
          icon: "error",
        });
      }
    } else {
      Toast.fire({
        icon: "error",
        title: "No internet connection",
      });
    }
  };

  const handleDelete = (index) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
    console.log("THE ROWS: ", rows);
  };

  const handleAddRow = () => {
    // const { programme, course, session, eMode } = formData;
    if (!programme || !course || !session || !eMode) {
      Toast.fire({
        icon: "error",
        title: "Please fill in all fields before adding a row.",
      });
      return;
    }

    const newRow = {
      Programme: programme,
      Course: course,
      RegistrationFees: 0,
      Session: session,
      EntryMode: eMode,
    };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  return (
    <MDBRow style={{ padding: "10px" }}>
      <div style={{ fontWeight: "900", padding: "20px" }}>COURSES ON OFFER</div>

      <MDBCol>
        <MDBRow>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 900,
              textAlign: "left",
              marginBottom: "10px",
              color: "green",
            }}
          >
            Add course by choosing it from the dropdown below, which will add it
            directly to the offered course table.
          </div>

          <MDBCol>
            <FormControl fullWidth>
              <InputLabel>Choose Programme</InputLabel>
              <Select
                value={programme}
                label="Choose Programme"
                onChange={(e) => {
                  setProgramme(e.target.value);

                  programmes.map((prog, i) => {
                    if (prog.name === e.target.value) {
                      setCourses(programmes[i].programs);
                    }
                  });
                }}
              >
                {programmes.map((prog, index) => (
                  <MenuItem key={index} value={prog.name}>
                    {prog.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBCol>

          <MDBCol>
            <FormControl fullWidth>
              <InputLabel>Choose Course</InputLabel>
              <Select
                value={course}
                label="Choose Course"
                onChange={(e) => setCourse(e.target.value)}
              >
                {courses.map((cse, index) => (
                  <MenuItem key={index} value={cse.name}>
                    {cse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-2">
          <MDBCol>
            <FormControl fullWidth>
              <InputLabel>Entry Mode</InputLabel>
              <Select
                value={eMode}
                label="Entry Mode"
                onChange={(e) => setEMode(e.target.value)}
              >
                {entryMode.map((mode, index) => (
                  <MenuItem key={index} value={mode.name}>
                    {mode.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBCol>

          <MDBCol>
            <FormControl fullWidth>
              <InputLabel>Session of Entry</InputLabel>
              <Select
                value={session}
                label="Session of Entry"
                onChange={(e) => setSession(e.target.value)}
              >
                {sessionOfEntry.map((session, index) => (
                  <MenuItem key={index} value={session.name}>
                    {session.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <button onClick={handleAddRow} className="cus-button">
              Add Course
            </button>
          </MDBCol>
        </MDBRow>

        <MDBCol>
          <table>
            <thead>
              <tr>
                <th>Departments</th>
                <th>Courses</th>
                <th>Entry</th>
                <th>Session</th>
                <th>Remove</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((item, index) => (
                <tr key={index}>
                  <td>{item.Programme}</td>
                  <td>{item.Course}</td>
                  <td>{item.Session}</td>
                  <td>{item.EntryMode}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(index)}
                      className="cus-button"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={saveCoursesOnOffer} className="cus-button w-50">
            Update
          </button>
        </MDBCol>
      </MDBCol>
    </MDBRow>
  );
};
