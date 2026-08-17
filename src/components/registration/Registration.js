import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../pictures/logo.png";
import MenuItem from "@mui/material/MenuItem";
import nigeria from "../nigeria.js";
import {
  secondrySubjects,
  secondryScores,
  requiredRegistrationKeys,
} from "../Arrays.js";
import {
  Card,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Select,
  TextField,
} from "@mui/material";
import { sessionOfEntry, entryMode } from "../Arrays.js";
import SelectionBox from "../SelectionBox";
import { MDBCol, MDBContainer, MDBRow } from "mdb-react-ui-kit";
import "../../css/style.css";
import ReactDeleteRow from "react-delete-row";
import request from "superagent";
import Swal from "sweetalert2";
import { Toast } from "../errorNotifier.js";
import { loader } from "../LoadingSpinner.js";
import axios from "axios";
import DateInput from "../DateInput.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { baseUrl } from "../../services/setup";

dayjs.extend(customParseFormat);

function Registration(props) {
  const location = useLocation();

  let navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [otherName, setOtherName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [address, setAddress] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [gender, setGender] = useState("Male");
  const [marriageStatus, setMarriageStatus] = useState("Single");
  const [jambNumber, setJambNumber] = useState("");
  const [jambScore, setJambScore] = useState("");
  const [selState, setSelState] = useState("Katsina");
  const [selLGA, setSelLGA] = useState("Funtua");
  const [lgas, setLgas] = useState([...nigeria[20].states.locals]);

  const [programmes, setProgrammes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programme, setProgramme] = useState("");
  const [course, setCourse] = useState("");

  const [courses2, setCourses2] = useState([]);
  const [programme2, setProgramme2] = useState("");
  const [course2, setCourse2] = useState("");

  const [primary, setPrimary] = useState("");
  const [secondary, setSecondarySchool] = useState("");
  const [otherSchool, setOtherSchool] = useState("");
  const [primaryGradYear, setPrimaryGradYear] = useState("2021");
  const [secGradYear, setSecGradYear] = useState("2021");
  const [otherGradYear, setOtherGradYear] = useState("2021");
  const [secondryScore, setSecondryScore] = useState("default");
  const [secondrySubject, setSecondrySubject] = useState("English Language");
  const [highestQualification, setHighestQualification] = useState("");
  const [gurdianName, setGurdianName] = useState("");
  const [gurdianAddress, setGurdianAddress] = useState("");
  const [gurdianPhoneNumber, setGudianPhoneNumber] = useState("");
  const [gurdianEmail, setGurdianEmail] = useState("");

  const [numOfSubjects, setNumOfSubjects] = useState(0);
  const [secScores, setSecScores] = useState([]);
  const [validate, setValidate] = useState(false);
  const [tableRow, setTableRow] = useState([]);
  const [SSCE_Score, setSSCEScore] = useState("9");
  const [SSCE_Sittings, setSSCESittings] = useState("1");
  const [hasJamb, setHasJamb] = useState(false);
  const [jambFromWaiver, setJambFromWaiver] = useState(false);
  const [isAwaitingResult, setIsAwaitingResult] = useState(false);
  const [applicantId, setApplicantId] = useState("");
  const [modeOfEntry, setModeOfEntry] = useState("Fresh");
  const [entrySession, setEntrySession] = useState("");
  const [activeSessionLoading, setActiveSessionLoading] = useState(true);
  const [ninGateChecked, setNinGateChecked] = useState(false);
  const refNav = React.createRef();
  const [ninVerified, setNinVerified] = useState(false);

  const applyNinData = (data) => {
    const toTitleCase = (str) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
    const firstNonEmpty = (...values) =>
      values.find((value) => typeof value === "string" && value.trim()) || "";
    const normalizeDate = (value) => {
      if (!value) return "";

      const parsedDate = dayjs(
        value,
        ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY"],
        true,
      );
      return parsedDate.isValid() ? parsedDate.format("DD/MM/YYYY") : value;
    };

    setFirstName(toTitleCase(data.firstname));
    setSurname(toTitleCase(data.lastname));
    setOtherName(toTitleCase(data.middlename));

    if (data.gender) {
      const normalizedGender = data.gender.toLowerCase();
      setGender(
        normalizedGender === "m" || normalizedGender === "male"
          ? "Male"
          : "Female",
      );
    }
    if (data.birthdate) {
      setDateValue(normalizeDate(data.birthdate));
    }
    if (data.residence) {
      const ninAddress = firstNonEmpty(
        data.residence.address1,
        data.residence.address,
        data.residence.address2,
        data.address,
        [data.residence.lga, data.residence.state].filter(Boolean).join(", "),
      );

      if (ninAddress) {
        setAddress(ninAddress);
      }
      if (data.residence.state) {
        const ninState = data.residence.state.toLowerCase();
        const matchedState = nigeria.find(
          (s) =>
            s.states.name.toLowerCase().includes(ninState) ||
            ninState.includes(s.states.name.toLowerCase()),
        );
        if (matchedState) {
          setSelState(matchedState.states.name);
          setLgas([...matchedState.states.locals]);
          if (data.residence.lga) {
            const ninLga = data.residence.lga.toLowerCase();
            const matchedLga = matchedState.states.locals.find(
              (l) =>
                l.name.toLowerCase().includes(ninLga) ||
                ninLga.includes(l.name.toLowerCase()),
            );
            setSelLGA(
              matchedLga ? matchedLga.name : matchedState.states.locals[0].name,
            );
          }
        }
      }
    }
  };

  const handleSubmit = async () => {
    const basicDetails = {
      FirstName: firstName,
      Surname: surname,
      OtherName: otherName,
      PhoneNumber: phoneNumber,
      Email: email,
      Address: address,
      State: selState,
      LGA: selLGA,
      Gender: gender,
      MaritalStatus: marriageStatus,
      DoB: dateValue,
      SSCE_Score: SSCE_Score,
      SSCE_Sittings: SSCE_Sittings,
      JambNumber: jambNumber,
      JambScore: jambScore,
      FirstChoiceProgramme: course,
      SecondChoiceProgramme: course2,
      ApplicationId: applicantId,
      ModeOfEntry: modeOfEntry,
      SessionOfEntry: entrySession,

      PrimarySchool: primary,
      SecondarySchool: secondary,
      Tertiary: otherSchool,
      HighestQualification: highestQualification,
      PrimaryYear: primaryGradYear,
      SecondaryYear: secGradYear,
      TertiaryYear: otherGradYear,

      ParentOrGuardianName: gurdianName,
      ParentOrGuardianPhone: gurdianPhoneNumber, // here there is a mistake but to be addressed during second pace
      ParentOrGuardianAddress: gurdianAddress,
      ParentOrGuardianEmail: gurdianEmail,
      SecondaryScores: secScores,
    };

    if (validateBasicDetails(basicDetails)) {
      loader({
        title: "Submitting your application",
        text: "Please! wait while we submit your application.",
      });

      await request
        .post("https://api.mcchstfuntua.edu.ng/apply.php")
        .type("application/json")
        .send(basicDetails)
        .then((response) => {
          Swal.fire({
            title: "Success!",
            text: response.body.message,
            icon: "success",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/applicant-profile", {
                state: { userEmail: email },
              });
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

  function validateBasicDetails(details) {
    if (numOfSubjects < 6) {
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

    // Regular expression for validating a Nigerian phone number
    const phoneNumberRegex = /^(\+234|0)([7-9]{1})([0-9]{9})$/;

    // Check if the phone number is valid and doesn't contain alphabets
    const isValid =
      phoneNumberRegex.test(gurdianPhoneNumber) &&
      !/[a-zA-Z]/.test(gurdianPhoneNumber);
    if (!isValid) {
      Toast.fire({
        icon: "error",
        title: `Invalid Parent/Gurdian phone number. The valid format is +234XXXX or just 070XXXX`,
      });
      return false;
    }

    if (gurdianEmail) {
      // Regular expression for validating an email address
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Check if the email address is valid
      const isValidEmail = emailRegex.test(gurdianEmail);
      if (!isValidEmail) {
        Toast.fire({
          icon: "error",
          title: `Invalid Parent/Gurdian email please check and try again.`,
        });
        return false;
      }
    }

    if (phoneNumber === gurdianPhoneNumber) {
      Toast.fire({
        icon: "error",
        title: `Applicant phone number must not be equal to gurdian number. Please provide the correct gurdian phone number.`,
      });
      return false;
    }

    return true;
  }

  const convertDate = (str) => {
    const dateString = str;
    const [day, month, year] = dateString.split("/");
    const convertedDate = new Date(`${year}-${month}-${day}T00:00:00`);

    return convertedDate;
  };

  const stringFormatter = (e) => {
    const inputValue = e.target.value;
    // Convert to lowercase and capitalize each word
    const formattedValue = inputValue
      .toLowerCase()
      .replace(/(^|\s)\S/g, (match) => match.toUpperCase());

    return formattedValue;
  };

  const handleAddRow = (secSubject, secScore) => {
    const row = (
      <ReactDeleteRow
        id={numOfSubjects}
        delay={1000}
        data={secScores}
        onDelete={(item) => {
          let retval = window.confirm("are you sure you want to delete: ");
          if (retval) {
            setNumOfSubjects(numOfSubjects - 1);
            return true;
          } else {
            return false;
          }
        }}
        onDeleteComplete={(item) => {
          // console.log("AFTER DELETE", item);
        }}
      >
        <td>{secSubject}</td>
        <td>{secScore}</td>
      </ReactDeleteRow>
    );

    setTableRow([...tableRow, row]);
  };

  const handleStateChange = (e) => {
    setSelState(e);

    nigeria.map((states) => {
      if (states.states.name == e) {
        setLgas([...states.states.locals]);
        setSelLGA(states.states.locals[0].name);
      }
    });
  };

  // Fetch the currently active/open session from the server
  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const sessionRes = await axios.get(`${baseUrl}session/active`);
        if (sessionRes.data && sessionRes.data.status && sessionRes.data.data) {
          setEntrySession(sessionRes.data.data.name);
        }
      } catch (error) {
        // Could not fetch active session
      } finally {
        setActiveSessionLoading(false);
      }
    };

    fetchActiveSession();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (location.state && location.state.userData) {
          const userData = location.state.userData;

          if (userData) {
            setFirstName(userData.FirstName);
            setSurname(userData.Surname);
            setOtherName(userData.OtherName);
            setEmail(userData.Email);
            setPhoneNumber(userData.PhoneNumber);
            setApplicantId(userData?.ApplicationId);

            // Restore persisted NIN verification if it already happened
            try {
              const ninRes = await axios.get(
                `${baseUrl}nin_verification/get/${encodeURIComponent(userData?.Email)}`,
              );
              if (
                ninRes.data.status &&
                !ninRes.data.is_pending &&
                ninRes.data.nin_data?.firstname
              ) {
                applyNinData(ninRes.data.nin_data);
                setNinVerified(true);
                setNinGateChecked(true);
              } else {
                navigate("/registration/nin-verification", {
                  state: {
                    ...location.state,
                    userData,
                  },
                });
                return;
              }
            } catch (ninError) {
              navigate("/registration/nin-verification", {
                state: {
                  ...location.state,
                  userData,
                },
              });
              return;
            }
          }

          // Pre-fill JAMB fields if fee was waived with JAMB details
          if (location.state.jambData) {
            const { jambNumber: jn, jambScore: js } = location.state.jambData;
            setJambNumber(jn);
            setJambScore(js);
            setHasJamb(true);
            setJambFromWaiver(true);
          }

          try {
            const response = await axios.get(
              "https://api.mcchstfuntua.edu.ng/admin/courses_on_offer_json.php",
            );

            const retProgrammes = response.data;

            // console.log("THE RET DATA", retProgrammes);

            setProgrammes(retProgrammes);
            setCourses(programmes[0].programs);
            setProgramme(programmes[0].name);
            setCourse(courses[0].name);
            setCourses2(programmes[0].programs);
            setProgramme2(programmes[0].name);
            setCourse2(courses2[1].name);
          } catch (error) {
            // Handle errors
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        // console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (secondryScore === "default") {
      //prevents initial render
      return;
    }

    if (numOfSubjects < 9) {
      setNumOfSubjects(numOfSubjects + 1);

      const secScoreRow = [secondrySubject, secondryScore];

      setSecScores([...secScores, secScoreRow]);
    } else {
      alert("You have entered the maximun subjects");
    }
  }, [secondryScore]);

  useEffect(() => {
    if (secondryScore === "default") {
      //prevents initial render
      return;
    }

    handleAddRow(secondrySubject, secondryScore);
    setSecondryScore("default");
  }, [secScores]);

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

  if (!ninGateChecked) {
    return (
      <MDBContainer className="d-flex flex-column align-items-center justify-content-center">
        <img
          className="logo"
          alt="logo"
          src={logo}
          onClick={() => {
            navigate("/");
          }}
        />
        <Card sx={{ maxWidth: 500 }} className="p-4 w-100 mt-3">
          <div className="reg-captions">Please wait</div>
          <div style={{ color: "#555", fontSize: "14px" }}>
            Checking your NIN verification status...
          </div>
        </Card>
      </MDBContainer>
    );
  }

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
                  <h1>Application Form 2026</h1>
                </div>
              </div>
              <div
                className="nin-verified-label"
                style={{ marginBottom: "8px" }}
              >
                ✓ NIN already verified.
              </div>

              <div className="reg-captions">Basic Info</div>

              <TextField
                label="First Name"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={firstName}
                onChange={() => {}}
                InputProps={{ readOnly: ninVerified }}
                required
              />
              <TextField
                label="Surname"
                value={surname}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={() => {}}
                InputProps={{ readOnly: ninVerified }}
                required
              />

              <TextField
                label="Other name"
                value={otherName}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={() => {}}
                InputProps={{ readOnly: ninVerified }}
              />

              <TextField
                label="Phone Number"
                value={phoneNumber}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={(e) => {}}
                required
              />

              <TextField
                label="Email"
                value={email}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={() => {}}
                required
              />

              <TextField
                label="Address"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                }}
                onBlur={(e) => {
                  setAddress(stringFormatter(e));
                }}
                required
              />

              <MDBRow>
                <MDBCol>
                  <SelectionBox
                    label="State"
                    className="center-cmp"
                    value={selState}
                    changed={(e) => {
                      handleStateChange(e);
                    }}
                    content={nigeria.map((state) => {
                      return (
                        <MenuItem value={state.states.name}>
                          {state.states.name}
                        </MenuItem>
                      );
                    })}
                  />
                </MDBCol>
                <MDBCol>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>LGA</InputLabel>
                    <Select
                      value={selLGA}
                      label="LGA"
                      onChange={(e) => {
                        setSelLGA(e.target.value);
                      }}
                    >
                      {lgas.map((lga) => {
                        return <MenuItem value={lga.name}>{lga.name}</MenuItem>;
                      })}
                    </Select>
                  </FormControl>
                </MDBCol>
              </MDBRow>

              <MDBRow>
                <MDBCol>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={gender}
                      label="Gender"
                      disabled={ninVerified}
                      onChange={(e) => {
                        setGender(e.target.value);
                      }}
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
                      value={marriageStatus}
                      label="Merital status"
                      onChange={(e) => {
                        setMarriageStatus(e.target.value);
                      }}
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
                  value={dateValue}
                  disabled={ninVerified}
                  handleValue={(e) => {
                    // Format the date to "DD/MM/YYYY"
                    const formattedDate = dayjs(e).format("DD/MM/YYYY");

                    // Update the state with the formatted date
                    setDateValue(formattedDate);
                  }}
                />
              </div>
            </Card>
          </MDBCol>
        </MDBRow>

        <div>
          <MDBRow className="mb-4 w-100">
            <MDBCol
              md={12}
              className="d-flex flex-column align-items-center justify-content-center"
            >
              <Card sx={{ maxWidth: 500 }} className="p-2 w-100">
                {/* <div className="reg-captions">Course Details</div> */}

                <FormGroup>
                  <div
                    style={{
                      fontSize: "12px",
                      textAlign: "left",
                      color: "green",
                      fontWeight: 600,
                      marginLeft: "20px",
                    }}
                  >
                    {jambFromWaiver ? (
                      <span style={{ color: "#05321e" }}>
                        ✓ JAMB details pre-filled — application fee waived.
                      </span>
                    ) : (
                      <>
                        Check I don't have JAMB box, if it is not yet ready.
                        <br />
                        <FormControlLabel
                          control={
                            <input className="reg-radio" type="checkbox" />
                          }
                          label="I don't have JAMB"
                          checked={hasJamb}
                          onChange={() => {
                            if (hasJamb) {
                              setHasJamb(false);
                            } else {
                              setHasJamb(true);
                            }
                          }}
                        />
                      </>
                    )}
                  </div>
                </FormGroup>

                {hasJamb && (
                  <div>
                    <TextField
                      style={{ width: "90%" }}
                      label="Your JAMB Number"
                      variant="outlined"
                      margin="normal"
                      value={jambNumber}
                      onChange={(e) => {
                        if (!jambFromWaiver) setJambNumber(e.target.value);
                      }}
                      InputProps={{ readOnly: jambFromWaiver }}
                      // required
                    />

                    <TextField
                      style={{ width: "90%" }}
                      label="Your JAMB Score"
                      variant="outlined"
                      margin="normal"
                      value={jambScore}
                      onChange={(e) => {
                        if (!jambFromWaiver) setJambScore(e.target.value);
                      }}
                      InputProps={{ readOnly: jambFromWaiver }}
                    />
                  </div>
                )}

                <Card className="mb-2" style={{ padding: "5px" }}>
                  <MDBRow>
                    <MDBCol className="w-100">
                      <div style={{ fontWeight: "700" }}>Mode of Entry</div>
                      <FormControl margin="normal" fullWidth>
                        <InputLabel>Select mode of entry</InputLabel>
                        <Select
                          value={modeOfEntry}
                          label="Choose Programme"
                          onChange={(e) => {
                            setModeOfEntry(e.target.value);
                          }}
                        >
                          {entryMode.map((e, i) => {
                            return <MenuItem value={e.name}>{e.name}</MenuItem>;
                          })}
                        </Select>
                      </FormControl>
                    </MDBCol>

                    <MDBCol className="w-100">
                      <div style={{ fontWeight: "700" }}>Session of Entry</div>
                      <FormControl margin="normal" fullWidth>
                        <TextField
                          label="Session of Entry"
                          value={
                            activeSessionLoading
                              ? "Loading..."
                              : entrySession || "No active session"
                          }
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </FormControl>
                    </MDBCol>
                  </MDBRow>
                </Card>

                <Card style={{ padding: "5px" }}>
                  <MDBRow>
                    <MDBCol className="w-100">
                      <div style={{ fontWeight: "700" }}>First choice</div>
                      <FormControl margin="normal" fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          Choose Programme
                        </InputLabel>
                        <Select
                          value={programme}
                          label="Choose Programme"
                          onChange={(e) => {
                            setProgramme(e.target.value);

                            programmes.map((prog, i) => {
                              // Add a check to ensure prog is defined
                              if (prog && prog.name === e.target.value) {
                                setCourses(programmes[i].programs);
                                setCourse(programmes[i].programs[0].name);
                              }
                              return null; // Return null to satisfy map function
                            });
                          }}
                        >
                          {programmes.map((prog) => (
                            <MenuItem key={prog.name} value={prog.name}>
                              {prog.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </MDBCol>
                  </MDBRow>

                  <MDBRow>
                    <MDBCol className="w-100">
                      <FormControl margin="normal" fullWidth>
                        <InputLabel>Choose Course</InputLabel>
                        <Select
                          value={course}
                          label="Choose Programme"
                          onChange={(e) => {
                            setCourse(e.target.value);
                          }}
                        >
                          {courses.map(
                            (cse) =>
                              cse.name !== course2 &&
                              cse.entryMode === modeOfEntry &&
                              cse.session === entrySession && (
                                <MenuItem key={cse.name} value={cse.name}>
                                  {cse.name}
                                </MenuItem>
                              ),
                          )}
                        </Select>
                      </FormControl>
                    </MDBCol>
                  </MDBRow>
                </Card>

                <Card style={{ padding: "5px", marginTop: "5px" }}>
                  <MDBRow>
                    <MDBCol className="w-100">
                      <div style={{ fontWeight: "700" }}>Second choice</div>
                      <FormControl margin="normal" fullWidth>
                        <InputLabel>Choose Programme</InputLabel>
                        <Select
                          value={programme2}
                          label="Choose Programme"
                          onChange={(e) => {
                            setProgramme2(e.target.value);

                            programmes.map((prog, i) => {
                              if (prog.name === e.target.value) {
                                setCourses2(programmes[i].programs);
                                try {
                                  setCourse2(programmes[i].programs[1].name);
                                } catch (error) {
                                  // setCourse2(programmes[i].programs[0].name);
                                }
                              }
                            });
                          }}
                        >
                          {programmes.map((prog) => {
                            return (
                              <MenuItem value={prog.name}>{prog.name}</MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </MDBCol>
                  </MDBRow>

                  <MDBRow>
                    <MDBCol className="w-100">
                      <FormControl margin="normal" fullWidth>
                        <InputLabel>Choose Course</InputLabel>
                        <Select
                          value={course2}
                          label="Choose Programme"
                          onChange={(e) => {
                            setCourse2(e.target.value);
                          }}
                        >
                          {Array.isArray(courses2) &&
                            courses2.map(
                              (cse) =>
                                cse.name !== course &&
                                cse.entryMode === modeOfEntry &&
                                cse.session === entrySession && (
                                  <MenuItem key={cse.name} value={cse.name}>
                                    {cse.name}
                                  </MenuItem>
                                ),
                            )}
                        </Select>
                      </FormControl>
                    </MDBCol>
                  </MDBRow>
                </Card>
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
                      onBlur={(e) => {
                        setPrimary(stringFormatter(e));
                      }}
                      required
                    />
                  </MDBCol>
                  <MDBCol className="w-100">
                    <FormControl margin="normal" fullWidth>
                      <InputLabel>Year of Graduation</InputLabel>
                      <Select
                        value={primaryGradYear}
                        label="Year of Graduation"
                        onChange={(e) => {
                          setPrimaryGradYear(e.target.value);
                        }}
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
                      onBlur={(e) => {
                        setSecondarySchool(stringFormatter(e));
                      }}
                      required
                    />
                  </MDBCol>
                  <MDBCol className="w-100">
                    <FormControl margin="normal" fullWidth>
                      <InputLabel>Year of Graduation</InputLabel>
                      <Select
                        value={secGradYear}
                        label="Year of Graduation"
                        onChange={(e) => {
                          setSecGradYear(e.target.value);
                        }}
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
                      onBlur={(e) => {
                        setOtherSchool(stringFormatter(e));
                      }}
                    />
                  </MDBCol>
                  <MDBCol className="w-100">
                    <FormControl margin="normal" fullWidth>
                      <InputLabel>Year of Graduation</InputLabel>
                      <Select
                        value={otherGradYear}
                        label="Year of Graduation"
                        onChange={(e) => {
                          setOtherGradYear(e.target.value);
                        }}
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
                  onBlur={(e) => {
                    setHighestQualification(e.target.value);
                  }}
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
                    If your result is not ready please check awaiting result
                    below to allow you proceed with your application.
                  </div>
                  <FormControlLabel
                    control={<input className="reg-radio" type="checkbox" />}
                    label="Awaiting result"
                    checked={isAwaitingResult}
                    onChange={() => {
                      if (isAwaitingResult) {
                        setIsAwaitingResult(false);
                      } else {
                        setIsAwaitingResult(true);
                      }
                    }}
                  />
                </FormGroup>

                {!isAwaitingResult && (
                  <div>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Number of Sitting</InputLabel>
                      <Select
                        value={SSCE_Sittings}
                        label="Number of Sitting"
                        onChange={(e) => {
                          setSSCESittings(e.target.value);
                        }}
                      >
                        <MenuItem value={"1"}>1</MenuItem>
                        <MenuItem value={"2"}>2</MenuItem>
                      </Select>
                    </FormControl>

                    <div>
                      <SelectionBox
                        val={numOfSubjects}
                        validate={validate}
                        value={secondrySubject}
                        label="Subjects"
                        changed={(e) => {
                          setSecondrySubject(e);
                        }}
                        content={secondrySubjects.map((subject) => {
                          return (
                            <MenuItem value={subject.name}>
                              {subject.name}
                            </MenuItem>
                          );
                        })}
                      />

                      <FormControl margin="normal" fullWidth>
                        <InputLabel>Grade</InputLabel>
                        <Select
                          value={secondryScore}
                          onChange={(e) => {
                            setSecondryScore(e.target.value);
                          }}
                          label="Grade"
                        >
                          <MenuItem value={"default"}>Choose Grade</MenuItem>
                          {secondryScores.map((score) => {
                            return (
                              <MenuItem value={score.name}>
                                {score.name}
                              </MenuItem>
                            );
                          })}
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
                          {tableRow.map((row) => {
                            return row;
                          })}
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
                  label="Parent/Gurdian Name"
                  variant="outlined"
                  className="center-cmp w-100"
                  margin="normal"
                  onBlur={(e) => {
                    setGurdianName(stringFormatter(e));
                  }}
                  required
                />
                <TextField
                  label="Parent/Gurdian Phone number"
                  className="center-cmp w-100"
                  variant="outlined"
                  margin="normal"
                  onBlur={(e) => {
                    let prNum = e.target.value;
                    if (prNum === phoneNumber) {
                      setGudianPhoneNumber("");
                      Toast.fire({
                        icon: "error",
                        title:
                          "Parent/Guardian's phone number must not be equal to the applicants phone number",
                      });
                    } else {
                      setGudianPhoneNumber(e.target.value);
                    }
                  }}
                  required
                />
                <TextField
                  label="Parent/Gurdian Address"
                  className="center-cmp w-100"
                  variant="outlined"
                  margin="normal"
                  onBlur={(e) => {
                    setGurdianAddress(stringFormatter(e));
                  }}
                  required
                />
                <TextField
                  label="Parent/Gurdian email"
                  className="center-cmp w-100"
                  variant="outlined"
                  margin="normal"
                  onBlur={(e) => {
                    setGurdianEmail(stringFormatter(e));
                  }}
                />

                <div
                  onClick={() => {
                    if (!ninVerified) {
                      Toast.fire({
                        icon: "warning",
                        title: "Please verify your NIN before submitting.",
                      });
                      navigate("/registration/nin-verification", {
                        state: {
                          ...location.state,
                          userData: location.state?.userData,
                          jambData: location.state?.jambData,
                        },
                      });
                      return;
                    }
                    handleSubmit();
                  }}
                  className="reg-button"
                >
                  Submit
                </div>
              </Card>
            </MDBCol>
          </MDBRow>
        </div>
      </MDBContainer>
    </div>
  );
}

export default Registration;
