import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../../pictures/logo.png";
import MenuItem from "@mui/material/MenuItem";
import nigeria from "../../nigeria.js";
import { requiredRegistrationKeys } from "../../Arrays.js";
import {
  Card,
  FormControl,
  InputLabel,
  Select,
  TextField,
} from "@mui/material";

import SelectionBox from "../../SelectionBox";
import { MDBCol, MDBContainer, MDBRow } from "mdb-react-ui-kit";
import "../../../css/style.css";
import ReactDeleteRow from "react-delete-row";
import request from "superagent";
import Swal from "sweetalert2";
import { Toast } from "../../errorNotifier.js";
import { loader } from "../../LoadingSpinner.js";
import axios from "axios";
import DateInput from "../../DateInput.js";
import dayjs from "dayjs";

function ValidationComponent(props) {
  const location = useLocation();

  let navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [otherName, setOtherName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");

  const [address, setAddress] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [gender, setGender] = useState("Male");
  const [marriageStatus, setMarriageStatus] = useState("Single");
  const [selState, setSelState] = useState("Katsina");
  const [selLGA, setSelLGA] = useState("Funtua");
  const [selStateOfResidence, setSelStateOfResidence] = useState("Katsina");
  const [selLGAOfResidence, setSelLGAOfResidence] = useState("Funtua");
  const [lgas, setLgas] = useState([...nigeria[20].states.locals]);
  const [lgasOfResidence, setLgasOfResidence] = useState([
    ...nigeria[20].states.locals,
  ]);
  const [bloodGroup, setBloodGroup] = useState("A");
  const [nin, setNIN] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [sponsorship, setSponsorship] = useState("Private");

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
  const [roomNumber, setRoomNumber] = useState("");
  const [jambNumber, setJambNumber] = useState("");
  const [jambScore, setJambScore] = useState("");
  const [jambYear, setJambYear] = useState("");

  const [nameOfSponsor, setNameOfSponsor] = useState("");
  const [addressOfSponsor, setAddressOfSponsor] = useState("");

  const [numOfSubjects, setNumOfSubjects] = useState(0);
  const [secScores, setSecScores] = useState([]);
  const [tableRow, setTableRow] = useState([]);

  useEffect(() => {
    let userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      // console.error("Email is undefined or null");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.post(
          "https://api.mcchstfuntua.edu.ng/applicant_profile.php",
          { email: userEmail },
          { headers: { "Content-Type": "application/json" } }
        );

        // console.log("RET VALUES: ", response.data);

        const admission = response.data.admission;
        // setAdmissionNumber(admission?.MatricNumber);

        const resApplication = response.data.application;

        setFirstName(resApplication.FirstName);
        setSurname(resApplication.Surname);
        setOtherName(resApplication.OtherName);
        setEmail(resApplication.Email);
        setPhoneNumber(resApplication.PhoneNumber);

        setAddress(resApplication.Address);
        setContactAddress(resApplication.ContactAddress);
        setSelState(resApplication.State);
        setSelStateOfResidence(resApplication.StateOfResidence);
        setSelLGA(resApplication.LGA);
        setSelLGAOfResidence(resApplication.LGAOfResidence);
        setGender(resApplication.Gender);
        setMarriageStatus(resApplication.MaritalStatus);
        setDateValue(resApplication.DoB);
        setBloodGroup(resApplication.BloodGroup);
        setNIN(resApplication.NIN);

        const resEdu = response.data.educational_details;
        // const resOtherDetails
        setPrimary(resEdu.PrimarySchool);
        setPrimaryGradYear(resEdu.PrimaryYear);
        setSecondarySchool(resEdu.SecondarySchool);
        setSecGradYear(resEdu.SecondaryYear);
        setOtherSchool(resEdu.Tertiary);
        setOtherGradYear(resEdu.TertiaryYear);
        setHighestQualification(resEdu.HighestQualification);

        const resCourses = response.data.course_details;

        // console.log("COURSES", resCourses);
        setJambNumber(resCourses.JambNumber);
        setJambScore(resCourses.JambScore);
        setJambYear(resCourses.JambYear);

        const resOther = response.data.other_details;
        setGurdianName(resOther.ParentOrGuardianName);
        setGudianPhoneNumber(resOther.ParentOrGuardianPhone);
        setGurdianEmail(resOther.ParentOrGuardianEmail);
        setGurdianAddress(resOther.ParentOrGuardianAddress);
        setSponsorship(resOther.Sponsorship);
        setRoomNumber(resOther.RoomNumber);
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
  }, [email, location.state, navigate]);

  const handleSubmit = async () => {
    const basicDetails = {
      FirstName: firstName,
      Surname: surname,
      OtherName: otherName,
      PhoneNumber: phoneNumber,
      Email: email,
      Address: address,
      ContactAddress: contactAddress,
      State: selState,
      LGA: selLGA,
      StateOfResidence: selStateOfResidence,
      LGAOfResidence: selLGAOfResidence,
      Gender: gender,
      MaritalStatus: marriageStatus,
      DoB: dateValue,
      BloodGroup: bloodGroup,
      PrimarySchool: primary,
      SecondarySchool: secondary,
      Tertiary: otherSchool,
      HighestQualification: highestQualification,
      PrimaryYear: primaryGradYear,
      SecondaryYear: secGradYear,
      TertiaryYear: otherGradYear,
      NIN: nin,
      JambNumber: jambNumber,
      JambScore: jambScore,
      JambYear: jambYear,

      ParentOrGuardianName: gurdianName,
      ParentOrGuardianPhone: gurdianPhoneNumber, // here there is a mistake but to be addressed during second pace
      ParentOrGuardianAddress: gurdianAddress,
      ParentOrGuardianEmail: gurdianEmail,
      SecondaryScores: secScores,
      Sponsorship: sponsorship,
      NameOfSponsor: nameOfSponsor,
      AddressOfSponsor: addressOfSponsor,
      RoomNumber: roomNumber,
    };

    if (validateBasicDetails(basicDetails)) {
      loader({
        title: "Submitting your data",
        text: "Please! Wait while we submit your data.",
      });

      await request
        .post("https://api.mcchstfuntua.edu.ng/confirm_details.php")
        .type("application/json")
        .send(basicDetails)
        .then((response) => {
          Swal.fire({
            title: "Success!",
            text: "Successful! Your data saved you need to login again.",
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

  function validateBasicDetails(details) {
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
      // Regular expression  for validating an email address
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

  const handleStateOfResidenceChange = (e) => {
    setSelStateOfResidence(e);

    nigeria.map((states) => {
      if (states.states.name == e) {
        setLgasOfResidence([...states.states.locals]);
        setSelLGAOfResidence(states.states.locals[0].name);
      }
    });
  };

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

  const currentYear = new Date().getFullYear(); // Gets the current year (e.g., 2025)
  let allYears = [];

  for (let x = 0; x <= 50; x++) {
    allYears.push(currentYear - x); // Goes back 50 years from current year
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
                  <h1>Data Validation</h1>
                </div>
              </div>
              <div className="reg-captions">Basic Info</div>

              <TextField
                label="First Name"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
                required
              />
              <TextField
                label="Surname"
                value={surname}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={(e) => {
                  setSurname(stringFormatter(e));
                }}
                required
              />

              <TextField
                label="Other name"
                value={otherName}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={(e) => {
                  setOtherName(stringFormatter(e));
                }}
              />

              <TextField
                label="Phone Number"
                value={phoneNumber}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                }}
                required
                disabled
              />

              <TextField
                label="Email"
                value={email}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
                disabled
              />

              {/* <TextField */}
                {/* label="Admission Number"
                value={admissionNumber}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={(e) => {
                  // setAdmissionNumber(e.target.value);
                }}
              /> */}

              <TextField
                label="NIN Number"
                value={nin}
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                onChange={(e) => {
                  setNIN(e.target.value);
                }}
              />

              <TextField
                label="Permanent Address"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={address}
                onChange={(e) => {
                  setAddress(stringFormatter(e));
                }}
                required
              />

              <TextField
                label="Contact Address(if different from above)"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={contactAddress}
                onChange={(e) => {
                  setContactAddress(stringFormatter(e));
                }}
              />

              <MDBRow>
                <MDBCol>
                  <SelectionBox
                    label="State of Origin"
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
                    <InputLabel>LGA of Origin</InputLabel>
                    <Select
                      value={selLGA}
                      label="LGA of Origin"
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
                  <SelectionBox
                    label="State of Residence"
                    className="center-cmp"
                    value={selStateOfResidence}
                    changed={(e) => {
                      handleStateOfResidenceChange(e);
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
                    <InputLabel>LGA of Residence</InputLabel>
                    <Select
                      value={selLGAOfResidence}
                      label="LGA of Residence"
                      onChange={(e) => {
                        setSelLGAOfResidence(e.target.value);
                      }}
                    >
                      {lgasOfResidence.map((lga) => {
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
                      <MenuItem value={"Divorced"}>Divorced</MenuItem>
                      <MenuItem value={"Widowed"}>Widowed</MenuItem>
                    </Select>
                  </FormControl>
                </MDBCol>
              </MDBRow>

              <MDBRow>
                <MDBCol>
                  <div
                    className="my-3"
                    style={{ zIndex: 1000, position: "relative" }}
                  >
                    <DateInput
                      label="Date of Birth"
                      value={dateValue}
                      handleValue={(e) => {
                        // Format the date to "DD/MM/YYYY"
                        const formattedDate = dayjs(e).format("DD/MM/YYYY");

                        // Update the state with the formatted date
                        setDateValue(formattedDate);
                      }}
                    />
                  </div>
                </MDBCol>
                <MDBCol>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      value={bloodGroup}
                      label="Merital status"
                      onChange={(e) => {
                        setBloodGroup(e.target.value);
                      }}
                    >
                      <MenuItem value={"A"}>A Group</MenuItem>
                      <MenuItem value={"B"}>B Group</MenuItem>
                      <MenuItem value={"AB"}>AB Group</MenuItem>
                      <MenuItem value={"O"}>O Group</MenuItem>
                    </Select>
                  </FormControl>
                </MDBCol>
              </MDBRow>
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
                    value={primary}
                    onChange={(e) => {
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
                    value={secondary}
                    onChange={(e) => {
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
                    value={otherSchool}
                    onChange={(e) => {
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
                value={highestQualification}
                onChange={(e) => {
                  setHighestQualification(e.target.value);
                }}
                fullWidth
              />

              <TextField
                label="Jamb Number"
                variant="outlined"
                margin="normal"
                value={jambNumber}
                onChange={(e) => {
                  setJambNumber(e.target.value);
                }}
                fullWidth
              />
              <MDBRow>
                <MDBCol>
                  {" "}
                  <TextField
                    label="Jamb Year"
                    variant="outlined"
                    margin="normal"
                    value={jambYear}
                    onChange={(e) => {
                      setJambYear(e.target.value);
                    }}
                    fullWidth
                  />
                </MDBCol>
                <MDBCol>
                  <TextField
                    label="Jamb Score"
                    variant="outlined"
                    margin="normal"
                    value={jambScore}
                    onChange={(e) => {
                      setJambScore(e.target.value);
                    }}
                    fullWidth
                  />
                </MDBCol>
              </MDBRow>
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
                value={gurdianName}
                onChange={(e) => {
                  setGurdianName(stringFormatter(e));
                }}
                required
              />
              <TextField
                label="Parent/Gurdian Phone number"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={gurdianPhoneNumber}
                onChange={(e) => {
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
                value={gurdianAddress}
                onChange={(e) => {
                  setGurdianAddress(stringFormatter(e));
                }}
                required
              />
              <TextField
                label="Parent/Gurdian email"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={gurdianEmail}
                onChange={(e) => {
                  setGurdianEmail(stringFormatter(e));
                }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Sponsorship</InputLabel>
                <Select
                  value={sponsorship}
                  label="Sponsorship"
                  onChange={(e) => {
                    setSponsorship(e.target.value);
                  }}
                >
                  <MenuItem value={"Private"}>Private</MenuItem>
                  <MenuItem value={"InService"}>In Service</MenuItem>
                  <MenuItem value={"Scholarship"}>Scholarship grant</MenuItem>
                </Select>
              </FormControl>

              {sponsorship !== "Private" && (
                <div>
                  <TextField
                    label="Name of sponsor or organisation"
                    className="center-cmp w-100"
                    variant="outlined"
                    margin="normal"
                    value={nameOfSponsor}
                    onChange={(e) => {
                      setNameOfSponsor(stringFormatter(e));
                    }}
                  />

                  <TextField
                    label="Address of Sponsor"
                    className="center-cmp w-100"
                    variant="outlined"
                    margin="normal"
                    value={addressOfSponsor}
                    onChange={(e) => {
                      setAddressOfSponsor(stringFormatter(e));
                    }}
                  />
                </div>
              )}

              <TextField
                label="Room Number(if residing in the College)"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={roomNumber}
                onChange={(e) => {
                  setRoomNumber(stringFormatter(e));
                }}
              />

              <div onClick={handleSubmit} className="reg-button">
                Is Confirmed
              </div>
            </Card>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default ValidationComponent;
