import * as React from "react";
import Paper from "@mui/material/Paper";
import "../admin/css/style.css";
import nairaIcon from "../../pictures/agent_tag.png";
import {
  MDBBtn,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBIcon,
  MDBInput,
  MDBRow,
} from "mdb-react-ui-kit";

import { useEffect } from "react";
import { useState } from "react";
import request from "superagent";
import TextInput from "../textField.js";
import { loader } from "../LoadingSpinner.js";
import Swal from "sweetalert2";
import { Toast } from "../errorNotifier.js";
import { useNavigate } from "react-router-dom";

export default function FinancialTab() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [feesList, setFeesList] = useState([]);
  const [init, setInit] = useState(false);
  const [applicationFees, setApplicationFees] = useState(0);
  const [acceptanceFee, setAcceptanceFee] = useState(0);
  const [schoolFees, setSchoolFees] = useState(0);
  const [adminSetup, setAdminSetup] = useState({});
  const [waiverApplicantEmail, setWaiverApplicantEmail] = useState("");
  const [waiverAccessCode, setWaiverAccessCode] = useState("");
  const [feeDescription, setFeeDescription] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

  useEffect(() => {
    if (!init) {
      handleDataFetch();
    }
  }, [init]);

  const handleApplicationFeesWaiver = async () => {
    if (waiverApplicantEmail === "") {
      Toast.fire({
        icon: "error",
        title: "waiver email can't be empty",
      });

      return;
    } else if (waiverAccessCode === "") {
      Toast.fire({
        icon: "error",
        title: "Waiver access code can't be empty ",
      });
      return;
    }

    const data = {
      email: waiverApplicantEmail,
      access_code: waiverAccessCode,
    };

    if (navigator.onLine) {
      loader({
        title: "Waiving",
        text: "Please! wait...",
      });

      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/fees_waiver.php")
        .type("application/json")
        .send(data)
        .then((response) => {
          console.log("WEIVER RESPONCE", response.body);
          Toast.fire({
            icon: "success",
            title: "waived successfully",
          });
        })
        .catch((err) => {
          Swal.fire({
            title: "Error!",
            text: err,
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

  const handleDataFetch = async () => {
    await request
      .get("https://api.mcchstfuntua.edu.ng/admin/application.php")
      .then((response) => {
        const basicDetails = response.body.details;

        setAdminSetup(basicDetails);

        setApplicationFees(basicDetails.ApplicationFees);
        setSchoolFees(basicDetails.SchoolFees);
        setAcceptanceFee(basicDetails.AcceptanceFee);
      })
      .catch((err) => {
        console.log("Error message:", err.response);
        console.log("ERROR", err);
      });

    await request
      .get("https://api.mcchstfuntua.edu.ng/admin/courses_on_offer.php")
      .then((response) => {
        setRows(response.body);
      })
      .catch((err) => {
        console.log("Error message:", err.response);
        console.log("ERROR", err);
      });

    await request
      .get("https://api.mcchstfuntua.edu.ng/admin/get_registration_fees.php")
      .then((response) => {
        setFeesList(response.body);
      })
      .catch((err) => {
        console.log("Error message:", err.response);
        console.log("ERROR", err);
      });

    setInit(true);
  };

  const saveBasicData = async () => {
    let setup = adminSetup;
    setup.ApplicationFees = applicationFees;
    setup.SchoolFees = schoolFees;
    setup.AcceptanceFee = acceptanceFee;

    if (navigator.onLine) {
      // progress spinner
      loader({
        title: "Updating",
        text: "Please! wait.",
      });

      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/save_setup.php")
        .type("application/json")
        .send(setup)
        .then((response) => {
          Toast.fire({
            icon: "success",
            title: "updated successfully",
          });
        })
        .catch((err) => {
          let errorText = err.response.text;
          console.log(errorText);

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

  const saveCoursesOnOffer = async () => {
    console.log("COURSES ON OFFER", rows);

    if (navigator.onLine) {
      // progress spinner
      loader({
        title: "Updating",
        text: "Please! wait.",
      });

      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/save_courses_on_offer.php")
        .type("application/json")
        .send(rows)
        .then((response) => {
          Toast.fire({
            icon: "success",
            title: "updated successfully",
          });
        })
        .catch((err) => {
          let errorText = err.response.text;

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

  const saveSchoolFees = async () => {
    if (navigator.onLine) {
      // progress spinner
      loader({
        title: "Updating",
        text: "Please! wait.",
      });

      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/save_school_fees.php")
        .type("application/json")
        .send(feesList)
        .then((response) => {
          Toast.fire({
            icon: "success",
            title: "updated successfully",
          });
        })
        .catch((err) => {
          let errorText = err.response.text;

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
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>Financial Management</h4>
        </MDBCardText>
      </MDBCardBody>
      <Paper className="p-2 my-2 w-100">
        <div style={{ fontWeight: "900", padding: "20px" }}>
          Special fees waiver
        </div>

        <MDBRow>
          <MDBRow>
            <MDBCol>
              <TextInput
                tValue={setWaiverApplicantEmail}
                tLabel="applicant email"
                className="center-cmp w-100"
                variant="outlined"
                onChange={(e) => {
                  setWaiverApplicantEmail(e.target.value);
                }}
              />
            </MDBCol>
            <MDBCol>
              <TextInput
                tValue={setWaiverAccessCode}
                tLabel="secure access code"
                tType="password"
                className="center-cmp w-100"
                variant="outlined"
                onChange={(e) => {
                  setWaiverAccessCode(e.target.value);
                }}
              />
            </MDBCol>
          </MDBRow>
          <div
            onClick={handleApplicationFeesWaiver}
            className="cus-button w-25 my-2"
          >
            Waive
          </div>
        </MDBRow>
      </Paper>

      <Paper className="p-2 my-2 w-100">
        <div style={{ fontWeight: "900", padding: "20px" }}>School Fees</div>

        <MDBRow className="mb-2">
          <MDBCol>
            <div className="d-flex align-items-center">
              <MDBInput
                label="Acceptance Fee"
                value={acceptanceFee}
                type="text"
                onChange={(e) => {
                  setAcceptanceFee(e.target.value);
                }}
                size="lg"
              />

              <MDBBtn
                className="w-25"
                size="lg"
                style={{ background: "#05321e", whiteSpace: "nowrap" }}
                onClick={() => {
                  if (!acceptanceFee) {
                    Toast.fire({
                      icon: "error",
                      title: "Acceptance field can't be empty",
                    });
                    return;
                  }

                  saveBasicData();
                }}
              >
                Save
              </MDBBtn>
            </div>
          </MDBCol>
        </MDBRow>
        <MDBRow className="mb-2">
          <MDBCol>
            <div className="d-flex align-items-center">
              <MDBInput
                label="Application Fee"
                value={applicationFees}
                type="text"
                onChange={(e) => {
                  setApplicationFees(e.target.value);
                }}
                size="lg"
              />

              <MDBBtn
                className="w-25"
                size="lg"
                style={{ background: "#05321e", whiteSpace: "nowrap" }}
                onClick={() => {
                  if (!applicationFees) {
                    Toast.fire({
                      icon: "error",
                      title: "Application fee's field can't be empty",
                    });
                    return;
                  }

                  saveBasicData();
                }}
              >
                Save
              </MDBBtn>
            </div>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBCol>
            <MDBInput
              label="description"
              value={feeDescription}
              type="text"
              onChange={(e) => {
                setFeeDescription(e.target.value);
              }}
              size="lg"
            />
          </MDBCol>
          <MDBCol>
            <div className="d-flex align-items-center">
              <MDBInput
                label="fee amount"
                value={feeAmount}
                type="text"
                onChange={(e) => {
                  setFeeAmount(e.target.value);
                }}
                size="lg"
              />

              <MDBBtn
                className="w-25"
                size="lg"
                style={{ background: "#05321e", whiteSpace: "nowrap" }}
                onClick={() => {
                  if (feeDescription === "" || feeAmount === "") {
                    Toast.fire({
                      icon: "error",
                      title: "Both fields must be provided",
                    });
                    return;
                  }

                  const newValue = {
                    Description: feeDescription,
                    Fee: feeAmount,
                  };
                  const updatedRows = [...feesList];
                  updatedRows.push(newValue);
                  setFeesList(updatedRows);

                  setFeeDescription("");
                  setFeeAmount("");
                }}
              >
                Add
              </MDBBtn>
            </div>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBRow>
            <MDBCol>
              <div className="w-100">
                <table className="w-100" style={{ tableLayout: "fixed" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "auto" }}>Description</th>
                      <th style={{ width: "auto" }}>Amount</th>
                      <th style={{ width: "10%" }}>Remove</th>
                    </tr>
                  </thead>

                  <tbody>
                    {feesList.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.Description}</td>
                          <td>₦{item.Fee}</td>
                          <td style={{ textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                              }}
                            >
                              <MDBIcon
                                onClick={(e) => {
                                  e.stopPropagation();

                                  const updatedRows = [...feesList];
                                  updatedRows.splice(index, 1);
                                  setFeesList(updatedRows);
                                }}
                                className="zindex-alert fa-sm"
                                style={{
                                  cursor: "pointer",
                                  color: "black",
                                }}
                                fas
                                icon="trash"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div onClick={saveSchoolFees} className="cus-button w-25 my-2">
                  Update
                </div>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBRow>
      </Paper>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <div style={{ fontWeight: "900", padding: "20px" }}>
            Courses on Offer
          </div>

          <MDBCol>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Departments</th>
                    <th>Courses</th>
                    <th>Tuition Fee</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{item.Programme}</td>
                        <td>{item.Course}</td>
                        <td>
                          <MDBInput
                            className="center-cmp w-100"
                            value={item.RegistrationFees}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              const updatedRows = [...rows];
                              updatedRows[index].RegistrationFees = newValue;
                              setRows(updatedRows);
                            }}
                            icon={nairaIcon}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div
                onClick={saveCoursesOnOffer}
                className="cus-button w-25 my-2"
              >
                Update
              </div>
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
}
