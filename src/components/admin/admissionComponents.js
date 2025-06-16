import Paper from "@mui/material/Paper";
import "../admin/css/style.css";
import {
  MDBBtn,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBContainer,
  MDBInput,
  MDBRow,
} from "mdb-react-ui-kit";
import { useEffect, useState } from "react";
import { entryMode, sessionOfEntry } from "../Arrays";
import request from "superagent";
import Swal from "sweetalert2";
import { Toast } from "../errorNotifier";
import { loader } from "../LoadingSpinner";
import { MuiFileInput } from "mui-file-input";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import {
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import { admissionProgrammes } from "../Arrays";
import useResizeObserver from "../hooks/useResizeObserver";
import { baseUrl } from "../../services/setup";

export default function AdmissionTab() {
  const [containerRef, size] = useResizeObserver();
  const [admissionSms, setAdmissionSms] = useState("");
  const [admissionEmail, setAdmissionEmail] = useState("");
  const [listOfAdmittedStudents, setListOfAdmittedStudents] = useState([]);
  const [file, setFile] = useState(null);
  const [jambCsv, setJambCsv] = useState(null);
  const [courseRegfile, setCourseRegFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e);
  };

  const handleJambFileChange = (e) => {
    setJambCsv(e);
  };

  const handleCourseRegFileChange = (e) => {
    setCourseRegFile(e);
  };

  const handleSubmit = async (e) => {
    if (!file) {
      Swal.fire({
        title: "Error!",
        text: "No file selected",
        icon: "error",
      });
      return;
    }

    loader({
      title: "Uploading",
      text: "Please wait...",
    });

    const formData = new FormData();
    formData.append("csv", file); // Ensure the name 'csv' matches your PHP script

    // try {
    //   await request
    //     .post("https://api.mcchstfuntua.edu.ng/admin/admission_upload.php")
    //     .send(formData)
    //     .set("Accept", "application/json");

    //   Toast.fire({
    //     icon: "success",
    //     title: "Uploaded successfully",
    //   });
    //   setFile(null);
    // } catch (err) {
    //   // console.error("Error uploading file", err);
    //   Swal.fire({
    //     title: "Error!",
    //     text: "There was an error uploading the file.",
    //     icon: "error",
    //   });
    // }

    Swal.fire({
      title: "Info!",
      text: "This feature if temporarily not available.",
      icon: "info",
    });
  };

  const handleJambAdmissionUpload = async (e) => {
    if (!jambCsv) {
      Swal.fire({
        title: "Error!",
        text: "No file selected",
        icon: "error",
      });
      return;
    }

    loader({
      title: "Uploading",
      text: "Please wait...",
    });

    const formData = new FormData();
    formData.append("csv", jambCsv); // Ensure the name 'csv' matches your PHP script

    try {
      await request
        .post(baseUrl + "/admission/jamb_upload")
        .send(formData)
        .set("Accept", "application/json");

      Toast.fire({
        icon: "success",
        title: "Uploaded successfully",
      });
      setJambCsv(null);
    } catch (err) {
      // console.error("Error uploading file", err);
      Swal.fire({
        title: "Error!",
        text: "There was an error uploading the file.",
        icon: "error",
      });
    }
  };

  const handleCourseRegUpload = async (e) => {
    if (!courseRegfile) {
      Swal.fire({
        title: "Error!",
        text: "No file selected",
        icon: "error",
      });
      return;
    }

    loader({
      title: "Uploading",
      text: "Please wait...",
    });

    const formData = new FormData();
    formData.append("csv", courseRegfile); // Ensure 'csv' matches your PHP script

    try {
      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/course_reg_upload.php")
        .send(formData)
        .set("Accept", "application/json");

      Toast.fire({
        icon: "success",
        title: "Uploaded successfully",
      });
      // setCourseRegFile(null);
    } catch (err) {
      // console.error("Error uploading file", err);

      let errorMessage = "There was an error uploading the file.";
      if (err.response && err.response.body && err.response.body.message) {
        errorMessage = err.response.body.message; // Custom server error message if available
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
      });
    }
  };

  const handleSaveNotification = async () => {
    if (navigator.onLine) {
      // progress spinner
      loader({
        title: "Updating",
        text: "Please! wait.",
      });

      const data = {
        SmsNotification: admissionSms,
        EmailNotification: admissionEmail,
      };

      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/save_admission_notifs.php")
        .type("application/json")
        .send(data)
        .then((response) => {
          const message = response.text;
          // console.log(message);
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

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleFetchData = async () => {
    if (listOfAdmittedStudents.length > 0) return; // Prevents unnecessary fetches

    try {
      await request
        .get("https://api.mcchstfuntua.edu.ng/admin/get_admitted.php")
        .type("application/json")
        .then((response) => {
          // console.log("FETCH RES: ", response);
          setListOfAdmittedStudents(response.body.list);
          setAdmissionSms(response.body.smsNote);
          setAdmissionEmail(response.body.emailNote);
        });
    } catch (err) {
      // console.log(err);
    }
  };

  const handleDataBackup = async () => {
    loader({
      title: "Processing",
      text: "Please wait...",
    });

    try {
      const response = await request
        .get("https://api.mcchstfuntua.edu.ng/admin/admission/backup/")
        .responseType("blob") // Ensures the response is treated as a blob
        .then((response) => {
          // console.log("FETCH RES: ", response);

          // Create a download link for the CSV file
          const url = window.URL.createObjectURL(new Blob([response.body]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "admission_data.csv"); // Define file name

          // Append the link to the body temporarily and click it to download
          document.body.appendChild(link);
          link.click();

          // Clean up by removing the link and revoking the URL
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Show success notification
          Toast.fire({
            icon: "success",
            title: "Backed successfully",
          });
        });
    } catch (err) {
      // console.log(err);
      Toast.fire({
        icon: "error",
        title: err.message || "An error occurred",
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
          <h4>Admission Management</h4>
        </MDBCardText>
      </MDBCardBody>

      <Paper className="mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <div style={{ fontWeight: "900", padding: "20px" }}>
            Admission Upload
          </div>
          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            <div>
              <MuiFileInput
                InputProps={{
                  inputProps: {
                    accept: ".csv",
                  },
                  startAdornment: <AttachFileIcon />,
                }}
                value={file}
                placeholder="choose the file here..."
                onChange={(e) => {
                  handleFileChange(e);
                }}
                clearIconButtonProps={{
                  title: "Remove",
                  children: <CloseIcon fontSize="small" />,
                }}
              />

              <MDBBtn
                onClick={handleSubmit}
                style={{ background: "#05321e", height: "56px" }}
                className="p-3"
              >
                Upload
              </MDBBtn>

              <div
                style={{
                  color: "red",
                  fontSize: "12px",
                  fontStyle: "italic",
                  cursor: "pointer",
                }}
                onClick={() => {
                  handleDataBackup();
                }}
              >
                backup admission data
              </div>
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>

      <Paper className="mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <div style={{ fontWeight: "900", padding: "20px" }}>
            Jamb Admission Upload
          </div>
          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            <div>
              <MuiFileInput
                InputProps={{
                  inputProps: {
                    accept: ".csv",
                  },
                  startAdornment: <AttachFileIcon />,
                }}
                value={jambCsv}
                placeholder="choose the file here..."
                onChange={(e) => {
                  handleJambFileChange(e);
                }}
                clearIconButtonProps={{
                  title: "Remove",
                  children: <CloseIcon fontSize="small" />,
                }}
              />

              <MDBBtn
                onClick={handleJambAdmissionUpload}
                style={{ background: "#05321e", height: "56px" }}
                className="p-3"
              >
                Upload
              </MDBBtn>
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>

      <Paper className="mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <StudentsAdmission />
      </Paper>

      <Paper className="mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <ChangeOfCourse />
      </Paper>

      <Paper className="mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <div style={{ fontWeight: "900", padding: "20px" }}>
            Course Registration Upload
          </div>
          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            <div>
              <MuiFileInput
                InputProps={{
                  inputProps: {
                    accept: ".csv",
                  },
                  startAdornment: <AttachFileIcon />,
                }}
                value={courseRegfile}
                placeholder="choose the file here..."
                onChange={handleCourseRegFileChange}
                clearIconButtonProps={{
                  title: "Remove",
                  children: <CloseIcon fontSize="small" />,
                }}
              />

              <MDBBtn
                onClick={handleCourseRegUpload}
                style={{ background: "#05321e", height: "56px" }}
                className="p-3"
              >
                Upload
              </MDBBtn>
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>

      <Paper className="mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <div style={{ fontWeight: "900", padding: "20px" }}>
            Notification of Admission
          </div>

          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            <TextField
              value={admissionSms}
              className="center-cmp w-100"
              variant="outlined"
              multiline
              onChange={(e) => {
                setAdmissionSms(e.target.value);
              }}
              label="SMS Notification"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </MDBCol>

          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            <div></div>
            <TextField
              value={admissionEmail}
              className="center-cmp w-100"
              variant="outlined"
              multiline
              onChange={(e) => {
                setAdmissionEmail(e.target.value);
              }}
              label="Email Notification"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol>
            <div
              onClick={handleSaveNotification}
              className="cus-button w-25 my-2"
            >
              Update
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
}

const ChangeOfCourse = () => {
  const [programme, setProgramme] = useState("");
  const [programmeCode, setProgrammeCode] = useState("");
  const [duration, setDuration] = useState("");
  const [programmesList, setProgrammesList] = useState([]);
  const [department, setDepartment] = useState("");
  const [applicationNo, setApplicationNo] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [stdDetail, setStdDetail] = useState({});

  const handleSubmitCourseChange = async () => {
    if (!validateInput()) {
      Swal.fire({
        title: "Error!",
        text: "Invalid input, please provide all necessary inputs",
        icon: "error",
      });
    } else {
      // Show progress spinner
      loader({
        title: "Processing",
        text: "Please! wait...",
      });

      const data = {
        Department: department,
        Programme: programme,
        ProgrammeCode: programmeCode,
        ApplicationId: applicationNo,
        Duration: duration,
        AdmissionNumber: admissionNumber,
      };

      await request
        .post(
          "https://api.mcchstfuntua.edu.ng/admin/admission/course_change/index.php"
        )
        .type("application/json")
        .send(data)
        .then((response) => {
          Toast.fire({
            icon: "success",
            title: "Changed successfully",
          });

          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
          Swal.fire({
            title: "Error!",
            text: err?.response?.text || "An unexpected error occurred.",
            icon: "error",
          });
        });
    }
  };

  const validateInput = () => {
    return !(department === "" || programme === "" || applicationNo === "");
  };

  const handleDepartmentChange = (e) => {
    const selectedDept = e.target.value;
    setDepartment(selectedDept);

    const programmes = admissionProgrammes.find(
      (dept) => dept.department === selectedDept
    ).programmes;

    setProgramme(programmes[0].programme);
    setProgrammeCode(programmes[0].programmeCode);
    setDuration(programmes[0].duration);

    setProgrammesList(programmes);
  };

  const handleProgrammeChange = (e) => {
    const selectedProgramme = e.target.value;
    setProgramme(selectedProgramme);

    const retProgramme = programmesList.find(
      (programme) => programme.programme === selectedProgramme
    );

    setProgramme(retProgramme.programme);
    setProgrammeCode(retProgramme.programmeCode);
    setDuration(retProgramme.duration);
  };

  const handleSearchStudent = async () => {
    if (userId === "") {
      Swal.fire({
        title: "Error!",
        text: "ID for the student must be provided.",
        icon: "error",
      });

      return;
    }
    // Show progress spinner
    loader({
      title: "Searching",
      text: "Please! wait...",
    });

    const data = { UserID: userId };

    await request
      .post(
        "https://api.mcchstfuntua.edu.ng/admin/admission/course_change/search/index.php"
      )
      .type("application/json")
      .send(data)
      .then((response) => {
        const retVal = response.body;

        if (retVal.ApplicationNo) {
          setApplicationNo(retVal.ApplicationNo);

          setStdDetail(retVal);
          Toast.fire({
            icon: "success",
            title: "Retrieved successfully",
          });
        } else {
          Toast.fire({
            icon: "error",
            title: retVal.error,
          });
          console.log("RET DATA: ", retVal.error);
        }
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          title: "Error!",
          text: err?.response?.text || "An unexpected error occurred.",
          icon: "error",
        });
      });
  };

  return (
    <div>
      <div style={{ fontWeight: "900", padding: "20px" }}>Change of course</div>

      <MDBContainer>
        <MDBRow style={{ padding: "10px" }}>
          <MDBCol>
            <div className="d-flex align-items-center">
              <MDBInput
                label="Search"
                value={userId}
                type="text"
                onChange={(e) => {
                  setUserId(e.target.value);
                }}
                size="lg"
              />

              <MDBBtn
                className="w-25"
                size="lg"
                style={{ background: "#05321e" }}
                onClick={handleSearchStudent}
              >
                Search
              </MDBBtn>
            </div>
          </MDBCol>
        </MDBRow>

        <MDBRow style={{ padding: "10px" }}>
          <MDBCol>
            <table>
              <tr>
                <td>
                  <table>
                    <thead>
                      <tr>
                        <th>FullName</th>
                        <th>Application Number</th>
                        <th>Department</th>
                        <th>Course</th>
                      </tr>
                    </thead>

                    <tbody>
                      <td>
                        <strong>{stdDetail.Fullname}</strong>
                      </td>
                      <td>
                        <strong>{stdDetail.ApplicationNo}</strong>
                      </td>

                      <td>
                        <strong>{stdDetail.Department}</strong>
                      </td>
                      <td>
                        <strong>{stdDetail.Programme}</strong>
                      </td>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </MDBCol>
        </MDBRow>

        <MDBRow style={{ paddingRight: "10px", paddingLeft: "10px" }}>
          <MDBCol>
            <MDBInput
              label="Admission Number"
              value={admissionNumber}
              type="text"
              onChange={(e) => {
                setAdmissionNumber(e.target.value);
              }}
            />
          </MDBCol>
        </MDBRow>

        <MDBRow style={{ paddingRight: "10px" }}>
          <MDBCol>
            <FormControl className="m-2" fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={department}
                label="Choose Department"
                onChange={handleDepartmentChange}
              >
                {admissionProgrammes.map((dept, index) => (
                  <MenuItem value={dept.department} key={index}>
                    {dept.department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBCol>
          <MDBCol style={{ marginRight: "10px" }}>
            <FormControl className="m-2" fullWidth>
              <InputLabel>Programme</InputLabel>
              <Select
                value={programme}
                label="Choose Programme"
                onChange={handleProgrammeChange}
              >
                {programmesList.map((e, i) => (
                  <MenuItem value={e.programme} key={i}>
                    {e.programme}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBCol>
            <MDBBtn
              onClick={handleSubmitCourseChange}
              className="w-50 m-2"
              style={{ background: "#05321e" }}
            >
              Change
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
};

const StudentsAdmission = () => {
  const [programme, setProgramme] = useState("");
  const [programmeCode, setProgrammeCode] = useState("");
  const [programmesList, setProgrammesList] = useState([]);
  const [department, setDepartment] = useState("");
  const [modeOfEntry, setModeOfEntry] = useState("Fresh");
  const [level, setLevel] = useState("100 Level");
  const [duration, setDuration] = useState("");
  const [admissionList, setAdmissionList] = useState([]);
  const [lectureCommencement, setLectureCommencement] = useState("");
  const [registrationClosure, setRegistrationClosure] = useState("");
  const [session, setSession] = useState("");

  // Fetch Admission List
  const handleGetListForAdmission = async () => {
    try {
      const response = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/admission/admit/list_applicants/index.php"
      );
      const fetchedData = response.body || [];
      setAdmissionList(
        fetchedData.map((item) => ({
          ...item,
          TestScore: item.TestScore || "", // Ensure TestScore is initialized
        }))
      );
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err.message || "An error occurred",
      });
    }
  };

  useEffect(() => {
    handleGetListForAdmission();
  }, []);

  const handleSubmitAdmission = async () => {
    // Show progress spinner
    loader({
      title: "Processing",
      text: "Please! wait...",
    });

    const requiredFields = [
      "ApplicationNo",
      "Email",
      "Department",
      "Programme",
      "ProgrammeCode",
      "ModeOfEntry",
      "Level",
      "Date",
      "SessionOfEntry",
      "RegistrationClousure",
      "LectureComencement",
      "Duration",
    ];

    const isValidEntry = (entry) =>
      requiredFields.every((field) => entry[field] && entry[field] !== "");

    const listOfAdmitted = admissionList
      .filter((e) => e.TestScore !== "")
      .map((e) => ({
        ...e,
        Department: department,
        Programme: programme,
        ProgrammeCode: programmeCode,
        ModeOfEntry: modeOfEntry,
        Level: level,
        Date: getCurrentDateFormatted(),
        SessionOfEntry: session,
        RegistrationClousure: registrationClosure,
        LectureComencement: lectureCommencement,
        Duration: duration,
      }))
      .filter(isValidEntry);

    if (listOfAdmitted.length === 0) {
      Swal.fire({
        title: "Error!",
        text: "No valid entries to submit.",
        icon: "error",
      });
      return;
    }

    await request
      .post(baseUrl + "admission/admit_students")
      .type("application/json")
      .send(listOfAdmitted)
      .then((response) => {
        console.log("THE RESPONSE", response);
        Toast.fire({
          icon: "success",
          title: "Admitted successfully",
        });

        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          title: "Error!",
          text: err?.response?.text || "An unexpected error occurred.",
          icon: "error",
        });
      });
  };

  const handleDepartmentChange = (e) => {
    const selectedDept = e.target.value;
    setDepartment(selectedDept);

    const programmes = admissionProgrammes.find(
      (dept) => dept.department === selectedDept
    ).programmes;

    setProgramme(programmes[0].programme);
    setProgrammeCode(programmes[0].programmeCode);
    setDuration(programmes[0].duration);

    setProgrammesList(programmes);
  };

  const handleProgrammeChange = (e) => {
    const selectedProgramme = e.target.value;
    setProgramme(selectedProgramme);

    const retProgramme = programmesList.find(
      (programme) => programme.programme === selectedProgramme
    );

    setProgramme(retProgramme.programme);
    setProgrammeCode(retProgramme.programmeCode);
    setDuration(retProgramme.duration);
  };

  const handleTestScore = (e, index) => {
    const newValue = e.target.value;
    setAdmissionList((prevList) =>
      prevList.map((item, idx) =>
        idx === index ? { ...item, TestScore: newValue } : item
      )
    );
  };

  useEffect(() => {
    setRegistrationClosure(localStorage.getItem("reg_cls"));
    setLectureCommencement(localStorage.getItem("lec_com"));
    setSession(localStorage.getItem("sess"));
  });

  const validateInput = () => {
    const requiredFields = [
      department,
      lectureCommencement,
      session,
      registrationClosure,
    ];
    return requiredFields.every((field) => field !== "");
  };

  const getCurrentDateFormatted = () => {
    const date = new Date();
    const day = date.getDate();

    // Get the correct ordinal suffix for the day
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th"; // Covers 4th-20th
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formattedDate = `${day}${getOrdinalSuffix(day)} ${
      monthNames[date.getMonth()]
    } ${date.getFullYear()}`;

    return formattedDate;
  };

  return (
    <MDBRow>
      <MDBCol>
        <div className="p-2">
          {/* Form Controls */}
          <FormControl className="m-2" fullWidth>
            <InputLabel>Mode of Entry</InputLabel>
            <Select
              value={modeOfEntry}
              label="Choose Programme"
              onChange={(e) => setModeOfEntry(e.target.value)}
            >
              {entryMode.map((e, i) => {
                return <MenuItem value={e.name}>{e.name}</MenuItem>;
              })}
            </Select>
          </FormControl>

          <FormControl className="m-2" fullWidth>
            <InputLabel>Level of Entry</InputLabel>
            <Select
              value={level}
              label="Choose Programme"
              onChange={(e) => setLevel(e.target.value)}
            >
              <MenuItem value="100 Level">100 Level</MenuItem>
              <MenuItem value="200 Level">200 Level</MenuItem>
              <MenuItem value="300 Level">300 Level</MenuItem>
            </Select>
          </FormControl>

          <FormControl className="m-2" fullWidth>
            <InputLabel>Session of Entry</InputLabel>
            <Select
              value={session}
              label="Choose Programme"
              onChange={(e) => {
                const sess = e.target.value;
                localStorage.setItem("sess", sess);
                setSession(sess);
              }}
            >
              {sessionOfEntry.map((e, i) => {
                return <MenuItem value={e.name}>{e.name}</MenuItem>;
              })}
            </Select>
          </FormControl>

          <FormControl className="m-2" fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={department}
              label="Choose Department"
              onChange={handleDepartmentChange}
            >
              {admissionProgrammes.map((dept, index) => (
                <MenuItem value={dept.department} key={index}>
                  {dept.department}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className="m-2" fullWidth>
            <InputLabel>Programme</InputLabel>
            <Select
              value={programme}
              label="Choose Programme"
              onChange={handleProgrammeChange}
            >
              {programmesList.map((e, i) => (
                <MenuItem value={e.programme} key={i}>
                  {e.programme}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Lecture Comencement"
            value={lectureCommencement}
            className="center-cmp m-2 w-100"
            variant="outlined"
            margin="normal"
            onChange={(e) => {
              const lectCommnt = e.target.value;

              localStorage.setItem("lec_com", lectCommnt);

              setLectureCommencement(lectCommnt);
            }}
            required
          />

          <TextField
            label="Registration Clousure"
            value={registrationClosure}
            className="center-cmp m-2 w-100"
            variant="outlined"
            margin="normal"
            onChange={(e) => {
              const regClosr = e.target.value;
              localStorage.setItem("reg_cls", regClosr);
              setRegistrationClosure(regClosr);
            }}
            required
          />

          <MDBBtn
            onClick={handleSubmitAdmission}
            className="w-50"
            style={{ background: "#05321e" }}
          >
            Admit
          </MDBBtn>
        </div>
      </MDBCol>
      <MDBCol>
        {/* Table */}
        <div className="mt-3" style={{ height: "480px", overflow: "scroll" }}>
          <table>
            <thead>
              <tr>
                <th>Application Number</th>
                <th>Fullname</th>
                <th>Test Score</th>
                <th>Selected</th>
              </tr>
            </thead>
            <tbody>
              {admissionList.map((item, index) => {
                const isStdSelected = item.TestScore.trim() !== ""; // Check if TestScore is not empty

                return (
                  <tr key={index}>
                    <td>{item.ApplicationNo}</td>
                    <td>{item.Fullname}</td>
                    <td>
                      <MDBInput
                        className="center-cmp w-100"
                        value={item.TestScore}
                        onChange={(e) => handleTestScore(e, index)}
                      />
                    </td>
                    <td>
                      <Checkbox checked={isStdSelected} disabled />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </MDBCol>
    </MDBRow>
  );
};
