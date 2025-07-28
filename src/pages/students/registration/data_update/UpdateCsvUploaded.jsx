import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../../../pictures/logo.png";
import nigeria from "../../../../components/nigeria.js";
import {
  secondrySubjects,
  secondryScores,
  requiredRegistrationKeys,
} from "../../../../components/Arrays.js";
import SelectionBox from "../../../../components/SelectionBox.js";
import { sessionOfEntry, entryMode } from "../../../../components/Arrays.js";
import ReactDeleteRow from "react-delete-row";
import request from "superagent";
import Swal from "sweetalert2";
import { Toast } from "../../../../components/errorNotifier.js";
import { loader } from "../../../../components/LoadingSpinner.js";
import axios from "axios";
import DateInput from "../../../../components/DateInput.js";
import MenuItem from "@mui/material/MenuItem";
import { MDBCol, MDBContainer, MDBRow } from "mdb-react-ui-kit";
import {
  Card,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Select,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";

function UpdateCsvUploaded() {
  const location = useLocation();
  const navigate = useNavigate();

  // Grouped state for applicant and guardian
  const [applicant, setApplicant] = useState({
    firstName: "",
    surname: "",
    otherName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateValue: "",
    gender: "Male",
    marriageStatus: "Single",
    jambNumber: "",
    jambScore: "",
    selState: "Katsina",
    selLGA: "Funtua",
    applicantId: "",
    modeOfEntry: "Fresh",
    entrySession: "2025/2026",
  });
  const [guardian, setGuardian] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
  });
  // Education
  const [education, setEducation] = useState({
    primary: "",
    secondary: "",
    otherSchool: "",
    primaryGradYear: "2021",
    secGradYear: "2021",
    otherGradYear: "2021",
    highestQualification: "",
  });
  // SSCE
  const [ssce, setSSCE] = useState({
    score: "9",
    sittings: "1",
    isAwaitingResult: false,
    numOfSubjects: 0,
    secScores: [],
    tableRow: [],
    secondryScore: "default",
    secondrySubject: "English Language",
  });
  // Others
  const [lgas, setLgas] = useState([...nigeria[20].states.locals]);
  const [validate, setValidate] = useState(false);
  const refNav = useRef();

  // String formatter
  const stringFormatter = (e) => {
    const inputValue = typeof e === "string" ? e : e?.target?.value || "";
    return inputValue
      .toLowerCase()
      .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
  };

  // Handle input changes
  const handleApplicantChange = (field, value) => {
    setApplicant((prev) => ({ ...prev, [field]: value }));
  };
  const handleGuardianChange = (field, value) => {
    setGuardian((prev) => ({ ...prev, [field]: value }));
  };
  const handleEducationChange = (field, value) => {
    setEducation((prev) => ({ ...prev, [field]: value }));
  };
  const handleSSCEChange = (field, value) => {
    setSSCE((prev) => ({ ...prev, [field]: value }));
  };

  // State/LGA logic
  const handleStateChange = (e) => {
    handleApplicantChange("selState", e);
    nigeria.forEach((states) => {
      if (states.states.name === e) {
        setLgas([...states.states.locals]);
        handleApplicantChange("selLGA", states.states.locals[0].name);
      }
    });
  };

  // Add SSCE subject row
  const handleAddRow = (secSubject, secScore) => {
    const row = (
      <ReactDeleteRow
        key={ssce.numOfSubjects}
        id={ssce.numOfSubjects}
        delay={1000}
        data={ssce.secScores}
        onDelete={() => {
          let retval = window.confirm("are you sure you want to delete: ");
          if (retval) {
            setSSCE((prev) => ({
              ...prev,
              numOfSubjects: prev.numOfSubjects - 1,
            }));
            return true;
          } else {
            return false;
          }
        }}
      >
        <td>{secSubject}</td>
        <td>{secScore}</td>
      </ReactDeleteRow>
    );
    setSSCE((prev) => ({ ...prev, tableRow: [...prev.tableRow, row] }));
  };

  // Handle SSCE subject/score selection
  useEffect(() => {
    if (ssce.secondryScore === "default") return;
    if (ssce.numOfSubjects < 9) {
      setSSCE((prev) => ({
        ...prev,
        numOfSubjects: prev.numOfSubjects + 1,
        secScores: [
          ...prev.secScores,
          [prev.secondrySubject, prev.secondryScore],
        ],
      }));
    } else {
      alert("You have entered the maximun subjects");
    }
    // eslint-disable-next-line
  }, [ssce.secondryScore]);

  useEffect(() => {
    if (ssce.secondryScore === "default") return;
    if (ssce.secScores.length > 0) {
      const last = ssce.secScores[ssce.secScores.length - 1];
      handleAddRow(last[0], last[1]);
      setSSCE((prev) => ({ ...prev, secondryScore: "default" }));
    }
    // eslint-disable-next-line
  }, [ssce.secScores]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (location.state && location.state.userData) {
          const userData = location.state.userData;
          if (userData) {
            setApplicant((prev) => ({
              ...prev,
              firstName: userData.FirstName,
              surname: userData.Surname,
              otherName: userData.OtherName,
              email: userData.Email,
              applicantId: userData?.ApplicationId,
            }));
          }
        } else {
          navigate("/login");
        }
      } catch (error) {}
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Validation
  function validateBasicDetails(details) {
    if (ssce.numOfSubjects < 6) {
      Toast.fire({
        icon: "error",
        title: `A minimum of 6 subjects for SSCE must be provided.`,
      });
      return false;
    } else {
      for (const key in details) {
        if (!details[key]) {
          for (const reqKey of requiredRegistrationKeys) {
            if (reqKey === key) {
              Toast.fire({
                icon: "error",
                title: `${key} is not provided.`,
              });
              return false;
            }
          }
        }
      }
    }
    const phoneNumberRegex = /^(\+234|0)([7-9]{1})([0-9]{9})$/;
    const isValid =
      phoneNumberRegex.test(guardian.phoneNumber) &&
      !/[a-zA-Z]/.test(guardian.phoneNumber);
    if (!isValid) {
      Toast.fire({
        icon: "error",
        title: `Invalid Parent/Guardian phone number. The valid format is +234XXXX or just 070XXXX`,
      });
      return false;
    }
    if (guardian.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidEmail = emailRegex.test(guardian.email);
      if (!isValidEmail) {
        Toast.fire({
          icon: "error",
          title: `Invalid Parent/Guardian email please check and try again.`,
        });
        return false;
      }
    }
    if (applicant.phoneNumber === guardian.phoneNumber) {
      Toast.fire({
        icon: "error",
        title: `Applicant phone number must not be equal to guardian number. Please provide the correct guardian phone number.`,
      });
      return false;
    }
    return true;
  }

  // Handle submit
  const handleSubmit = async () => {
    const basicDetails = {
      FirstName: applicant.firstName,
      Surname: applicant.surname,
      OtherName: applicant.otherName,
      PhoneNumber: applicant.phoneNumber,
      Email: applicant.email,
      Address: applicant.address,
      State: applicant.selState,
      LGA: applicant.selLGA,
      Gender: applicant.gender,
      MaritalStatus: applicant.marriageStatus,
      DoB: applicant.dateValue,
      SSCE_Score: ssce.score,
      SSCE_Sittings: ssce.sittings,
      JambNumber: applicant.jambNumber,
      JambScore: applicant.jambScore,
      FirstChoiceProgramme: "", // Not handled in this refactor
      SecondChoiceProgramme: "", // Not handled in this refactor
      ApplicationId: applicant.applicantId,
      ModeOfEntry: applicant.modeOfEntry,
      SessionOfEntry: applicant.entrySession,
      PrimarySchool: education.primary,
      SecondarySchool: education.secondary,
      Tertiary: education.otherSchool,
      HighestQualification: education.highestQualification,
      PrimaryYear: education.primaryGradYear,
      SecondaryYear: education.secGradYear,
      TertiaryYear: education.otherGradYear,
      ParentOrGuardianName: guardian.name,
      ParentOrGuardianPhone: guardian.phoneNumber,
      ParentOrGuardianAddress: guardian.address,
      ParentOrGuardianEmail: guardian.email,
      SecondaryScores: ssce.secScores,
    };
    if (validateBasicDetails(basicDetails)) {
      loader({
        title: "Submitting your updates",
        text: "Please! wait while we submit your updates.",
      });
      await request
        .post("https://api.mcchstfuntua.edu.ng/csv_update.php")
        .type("application/json")
        .send(basicDetails)
        .then((response) => {
          Swal.fire({
            title: "Success!",
            text: response.body.message,
            icon: "success",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/login");
            }
          });
        })
        .catch((err) => {
          Toast.fire({
            icon: "error",
            title: err,
          });
        });
    }
  };

  // Years list
  const currentYear = new Date().getFullYear();
  let allYears = [];
  for (let x = 0; x <= 50; x++) {
    allYears.push(currentYear - x);
  }
  const yearsList = allYears.map((year) => (
    <MenuItem key={year} value={year}>
      {year}
    </MenuItem>
  ));

  return (
    <div>
      <MDBContainer className="d-flex flex-column align-items-center justify-content-center">
        <img
          className="logo"
          alt="logo"
          src={logo}
          onClick={() => {
            navigate("/");
          }}
        />
        <MDBRow className="mb-4 w-100">
          <MDBCol className="d-flex flex-column align-items-center justify-content-center">
            <Card sx={{ maginLeft: 20, maxWidth: 500 }} className="p-4">
              <div className="m-4">
                <div
                  style={{
                    fontWeight: "900",
                    fontSize: "32px",
                    color: "#05321e",
                  }}
                >
                  <h1>Mandatory Profile Update</h1>
                </div>
              </div>
              <div className="reg-captions">Basic Info</div>
              <TextField
                label="First Name"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={stringFormatter(applicant.firstName)}
                onChange={(e) =>
                  handleApplicantChange("firstName", stringFormatter(e))
                }
                required
              />
              <TextField
                label="Surname"
                value={stringFormatter(applicant.surname)}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={(e) =>
                  handleApplicantChange("surname", stringFormatter(e))
                }
                required
              />
              <TextField
                label="Other name"
                value={stringFormatter(applicant.otherName)}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={(e) =>
                  handleApplicantChange("otherName", stringFormatter(e))
                }
              />
              <TextField
                label="Phone Number"
                value={applicant.phoneNumber}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={(e) =>
                  handleApplicantChange("phoneNumber", e.target.value)
                }
                required
              />
              <TextField
                label="Email"
                value={applicant.email}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                disabled
                required
              />
              <TextField
                label="Address"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onBlur={(e) =>
                  handleApplicantChange("address", stringFormatter(e))
                }
                required
              />
              <MDBRow>
                <MDBCol>
                  <SelectionBox
                    label="State"
                    className="center-cmp"
                    value={applicant.selState}
                    changed={handleStateChange}
                    content={nigeria.map((state) => (
                      <MenuItem
                        key={state.states.name}
                        value={state.states.name}
                      >
                        {state.states.name}
                      </MenuItem>
                    ))}
                  />
                </MDBCol>
                <MDBCol>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>LGA</InputLabel>
                    <Select
                      value={applicant.selLGA}
                      label="LGA"
                      onChange={(e) =>
                        handleApplicantChange("selLGA", e.target.value)
                      }
                    >
                      {lgas.map((lga) => (
                        <MenuItem key={lga.name} value={lga.name}>
                          {lga.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </MDBCol>
              </MDBRow>
              <MDBRow>
                <MDBCol>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={applicant.gender}
                      label="Gender"
                      onChange={(e) =>
                        handleApplicantChange("gender", e.target.value)
                      }
                    >
                      <MenuItem value={"Male"}>Male</MenuItem>
                      <MenuItem value={"Female"}>Female</MenuItem>
                    </Select>
                  </FormControl>
                </MDBCol>
                <MDBCol>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Marital status</InputLabel>
                    <Select
                      value={applicant.marriageStatus}
                      label="Merital status"
                      onChange={(e) =>
                        handleApplicantChange("marriageStatus", e.target.value)
                      }
                    >
                      <MenuItem value={"Single"}>Single</MenuItem>
                      <MenuItem value={"Married"}>Married</MenuItem>
                    </Select>
                  </FormControl>
                </MDBCol>
              </MDBRow>
              <div style={{ zIndex: 1000, position: "relative" }}>
                <DateInput
                  label="Date of Birth"
                  value={applicant.dateValue}
                  handleValue={(e) => {
                    const formattedDate = dayjs(e).format("DD/MM/YYYY");
                    handleApplicantChange("dateValue", formattedDate);
                  }}
                />
              </div>
            </Card>
          </MDBCol>
        </MDBRow>
        <MDBRow className="mb-4 w-100">
          <MDBCol
            md={12}
            className="d-flex flex-column align-items-center justify-content-center"
          >
            <Card sx={{ maxWidth: 500 }} className="p-4 w-100">
              <div className="reg-captions">Educational Details</div>
              <MDBRow>
                <MDBCol className="w-100">
                  <TextField
                    label="Primary School"
                    variant="outlined"
                    margin="normal"
                    onBlur={(e) =>
                      handleEducationChange("primary", stringFormatter(e))
                    }
                    required
                  />
                </MDBCol>
                <MDBCol className="w-100">
                  <FormControl margin="normal" fullWidth>
                    <InputLabel>Year of Graduation</InputLabel>
                    <Select
                      value={education.primaryGradYear}
                      label="Year of Graduation"
                      onChange={(e) =>
                        handleEducationChange("primaryGradYear", e.target.value)
                      }
                    >
                      {yearsList}
                    </Select>
                  </FormControl>
                </MDBCol>
              </MDBRow>
              <MDBRow>
                <MDBCol className="w-100">
                  <TextField
                    label="Secondary School"
                    variant="outlined"
                    margin="normal"
                    onBlur={(e) =>
                      handleEducationChange("secondary", stringFormatter(e))
                    }
                    required
                  />
                </MDBCol>
                <MDBCol className="w-100">
                  <FormControl margin="normal" fullWidth>
                    <InputLabel>Year of Graduation</InputLabel>
                    <Select
                      value={education.secGradYear}
                      label="Year of Graduation"
                      onChange={(e) =>
                        handleEducationChange("secGradYear", e.target.value)
                      }
                    >
                      {yearsList}
                    </Select>
                  </FormControl>
                </MDBCol>
              </MDBRow>
              <MDBRow>
                <MDBCol className="w-100">
                  <TextField
                    label="Other School"
                    variant="outlined"
                    margin="normal"
                    onBlur={(e) =>
                      handleEducationChange("otherSchool", stringFormatter(e))
                    }
                  />
                </MDBCol>
                <MDBCol className="w-100">
                  <FormControl margin="normal" fullWidth>
                    <InputLabel>Year of Graduation</InputLabel>
                    <Select
                      value={education.otherGradYear}
                      label="Year of Graduation"
                      onChange={(e) =>
                        handleEducationChange("otherGradYear", e.target.value)
                      }
                    >
                      {yearsList}
                    </Select>
                  </FormControl>
                </MDBCol>
              </MDBRow>
              <TextField
                label="Highest Qualification"
                variant="outlined"
                margin="normal"
                onBlur={(e) =>
                  handleEducationChange(
                    "highestQualification",
                    stringFormatter(e)
                  )
                }
                fullWidth
              />
            </Card>
          </MDBCol>
        </MDBRow>
        <MDBRow className="mb-4 w-100">
          <MDBCol className="d-flex flex-column align-items-center justify-content-center">
            <Card sx={{ maxWidth: 500 }} className="p-4 w-100">
              <div className="reg-captions">SSCE Result</div>
              <FormGroup>
                <div
                  style={{
                    fontSize: "12px",
                    textAlign: "left",
                    color: "green",
                    fontWeight: 600,
                  }}
                >
                  If your result is not ready please check awaiting result below
                  to allow you proceed with your application.
                </div>
                <FormControlLabel
                  control={<input className="reg-radio" type="checkbox" />}
                  label="Awaiting result"
                  checked={ssce.isAwaitingResult}
                  onChange={() =>
                    handleSSCEChange("isAwaitingResult", !ssce.isAwaitingResult)
                  }
                />
              </FormGroup>
              {!ssce.isAwaitingResult && (
                <div>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Number of Sitting</InputLabel>
                    <Select
                      value={ssce.sittings}
                      label="Number of Sitting"
                      onChange={(e) =>
                        handleSSCEChange("sittings", e.target.value)
                      }
                    >
                      <MenuItem value={"1"}>1</MenuItem>
                      <MenuItem value={"2"}>2</MenuItem>
                    </Select>
                  </FormControl>
                  <div>
                    <SelectionBox
                      val={ssce.numOfSubjects}
                      validate={validate}
                      value={ssce.secondrySubject}
                      label="Subjects"
                      changed={(e) => handleSSCEChange("secondrySubject", e)}
                      content={secondrySubjects.map((subject) => (
                        <MenuItem key={subject.name} value={subject.name}>
                          {subject.name}
                        </MenuItem>
                      ))}
                    />
                    <FormControl margin="normal" fullWidth>
                      <InputLabel>Grade</InputLabel>
                      <Select
                        value={ssce.secondryScore}
                        onChange={(e) =>
                          handleSSCEChange("secondryScore", e.target.value)
                        }
                        label="Grade"
                      >
                        <MenuItem value={"default"}>Choose Grade</MenuItem>
                        {secondryScores.map((score) => (
                          <MenuItem key={score.name} value={score.name}>
                            {score.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th>SUBJECT</th>
                          <th>GRADE</th>
                          <th>DELETE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ssce.tableRow.map((row, idx) =>
                          React.cloneElement(row, { key: idx })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          </MDBCol>
        </MDBRow>
        <MDBRow className="mb-4 w-100">
          <MDBCol className="d-flex flex-column align-items-center justify-content-center">
            <Card sx={{ maxWidth: 500 }} className="p-4">
              <div className="reg-captions">Other Details</div>
              <TextField
                id="outlined-basic"
                label="Parent/Guardian Name"
                variant="outlined"
                className="center-cmp w-100"
                margin="normal"
                onBlur={(e) => handleGuardianChange("name", stringFormatter(e))}
                required
              />
              <TextField
                label="Parent/Guardian Phone number"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onBlur={(e) => {
                  let prNum = stringFormatter(e);
                  if (prNum === applicant.phoneNumber) {
                    handleGuardianChange("phoneNumber", "");
                    Toast.fire({
                      icon: "error",
                      title:
                        "Parent/Guardian's phone number must not be equal to the applicants phone number",
                    });
                  } else {
                    handleGuardianChange("phoneNumber", prNum);
                  }
                }}
                required
              />
              <TextField
                label="Parent/Guardian Address"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onBlur={(e) =>
                  handleGuardianChange("address", stringFormatter(e))
                }
                required
              />
              <TextField
                label="Parent/Guardian email"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onBlur={(e) =>
                  handleGuardianChange("email", stringFormatter(e))
                }
              />
              <div onClick={handleSubmit} className="reg-button">
                Submit
              </div>
            </Card>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default UpdateCsvUploaded;
