import Paper from "@mui/material/Paper";
// import "../../../admin/css/style.css";

import {
  MDBBtn,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBIcon,
  MDBInput,
  MDBRow,
} from "mdb-react-ui-kit";

import { useEffect, useState } from "react";
import request from "superagent";
import Swal from "sweetalert2";
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { Toast } from "../../../utils/toast.js";
import {
  admissionProgrammes,
  sessionOfEntry,
} from "../../../components/Arrays.js";
import { loader } from "../../../utils/loading-spinner.js";
import { baseUrl } from "../../../services/setup.js";
import { postData } from "../../../utils/post-data.js";

export default function EditInvoice() {
  const location = useLocation();
  const [feesList, setFeesList] = useState([]);
  const [programmesList, setProgrammesList] = useState([]);
  const [department, setDepartment] = useState("");
  const [programme, setProgramme] = useState("");
  const [programmeCode, setProgrammeCode] = useState("");
  const [target, setTarget] = useState("");
  const [targetSession, setTargetSession] = useState("");
  const [deptSession, setDeptSession] = useState("");
  const [specificTarget, setSpecificTarget] = useState("");
  const [studentId, setStudentId] = useState("");
  const [feeDescription, setFeeDescription] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [invoiceTitle, setInvoiceTitle] = useState("");

  const handleDepartmentChange = (e) => {
    const selectedDept = e.target.value;
    setDepartment(selectedDept);

    const departmentData = admissionProgrammes.find(
      (dept) => dept.department === selectedDept
    );

    if (!departmentData || !departmentData.programmes?.length) {
      setProgrammesList([]);
      setProgramme("");
      return;
    }

    const programmes = departmentData.programmes;
    setProgrammesList(programmes);

    const defaultProgramme = programmes[0];
    setProgramme(defaultProgramme.programme);
    setProgrammeCode(defaultProgramme.programmeCode);
  };

  const handleProgrammeChange = (e) => {
    const selectedProgramme = e.target.value;
    setProgramme(selectedProgramme); // keep state in sync
    programmeChange(selectedProgramme);
  };

  const programmeChange = (selectedProgramme) => {
    if (!Array.isArray(programmesList)) return;

    const retProgramme = programmesList.find(
      (programme) => programme.programme === selectedProgramme
    );

    if (!retProgramme) {
      console.warn("Programme not found in the list.");
      return;
    }

    // Set programme and programmeCode
    setProgramme(retProgramme.programme);
    setProgrammeCode(retProgramme.programmeCode); // <-- Make sure setProgrammeCode exists in your state
  };

  const createInvoice = async () => {
    if (navigator.onLine) {
      // progress spinner
      loader({
        title: "Creating",
        text: "Please! wait.",
      });

      const incoiceData = {
        invoiceItems: feesList,
        target: target,
        targetSession: targetSession,
        specificTarget: specificTarget,
        department: department,
        programme: programme,
        programmeCode: programmeCode,
        deptSession: deptSession,
        studentId: studentId,
        invoiceTitle: invoiceTitle,
      };

      await request
        .post(baseUrl + "invoices/generate_invoice")
        .type("application/json")
        .send(incoiceData)
        .then((response) => {
          Toast.fire({
            icon: "success",
            title: "Invoice created successfully",
          });
        })
        .catch((err) => {
          // let errorText = err.response.text;
          console.log("Error message:", err.response);

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

  const handleCreateInvoice = () => {
    if (feesList.length === 0) {
      Toast.fire({
        icon: "error",
        title: "No fees added",
      });
      return;
    }

    if (target === "") {
      Toast.fire({
        icon: "error",
        title: "Target not selected",
      });
      return;
    }

    if (target === "Specific Target" && specificTarget === "") {
      Toast.fire({
        icon: "error",
        title: "Specific target not selected",
      });
      return;
    } else if (target === "Specific Target" && specificTarget === "session") {
      if (targetSession === "") {
        Toast.fire({
          icon: "error",
          title: "Session not selected",
        });
        return;
      }
    } else if (
      target === "Specific Target" &&
      specificTarget === "department"
    ) {
      if (deptSession === "") {
        Toast.fire({
          icon: "error",
          title: "Session not selected",
        });
        return;
      } else if (department === "") {
        Toast.fire({
          icon: "error",
          title: "Department not selected",
        });
        return;
      } else if (programme === "") {
        Toast.fire({
          icon: "error",
          title: "Programme not selected",
        });
        return;
      }
    } else if (target === "Specific Target" && specificTarget === "student") {
      if (studentId === "") {
        Toast.fire({
          icon: "error",
          title: "Student ID not provided",
        });
        return;
      }
    }

    createInvoice();
  };

  useEffect(() => {
    if (location.state && location.state.invoiceData) {
      console.log("Edit Invoice data:", location.state.invoiceData);
      const {
        title,
        // feesList,
        target,
        sessionOfEntry,
        department,
        programme,
        programmeCode,
        studentId,
        invoice_code,
      } = location.state.invoiceData;

      const fetchFeesList = async () => {
        const invoiceItems = await postData(
          baseUrl + "invoices/get_invoice_items_by_id/",
          {
            invoiceId: invoice_code,
          }
        );

        if (invoiceItems) {
          setFeesList(invoiceItems);
        }
      };

      fetchFeesList();
      setInvoiceTitle(title);
      setTarget(target !== "specific" ? "General School" : "Specific Target");

      if (programme) {
        const selectedDept = department;
        const departmentData = admissionProgrammes.find(
          (dept) => dept.department === selectedDept
        );

        if (!departmentData || !departmentData.programmes?.length) {
          setProgrammesList([]);
          setProgramme("");
          return;
        }

        const programmes = departmentData.programmes;
        setProgrammesList(programmes);

        setSpecificTarget("department");
        setDepartment(department);
        setProgramme(programme);
        setProgrammeCode(programmeCode);
        setDeptSession(sessionOfEntry);
      }

      setTargetSession(sessionOfEntry);
      setStudentId(studentId);
    }
  }, [location.state]);

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>Edit Invoice</h4>
        </MDBCardText>
      </MDBCardBody>

      <Paper className="p-2 my-2 w-100">
        <MDBRow>
          <MDBCol>
            <MDBInput
              label="Invoice Title"
              value={invoiceTitle}
              type="text"
              onChange={(e) => {
                setInvoiceTitle(e.target.value);
              }}
              size="lg"
            />
          </MDBCol>
        </MDBRow>
      </Paper>

      <Paper className="p-2 my-2 w-100">
        <div
          style={{ textAlign: "left", fontWeight: "bold", marginBottom: "8px" }}
        >
          Invoice items
        </div>

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
                    description: feeDescription,
                    amount: feeAmount,
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
          <MDBCol>
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
                      <td>{item.Description ?? item.description}</td>
                      <td>₦{item.Fee ?? item.amount}</td>
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
          </MDBCol>
        </MDBRow>
      </Paper>

      <Paper className="p-2 my-2 w-100">
        <div
          style={{ textAlign: "left", fontWeight: "bold", marginBottom: "8px" }}
        >
          Target
        </div>

        <MDBRow className="m-2" style={{ justifyContent: "flex-start" }}>
          <MDBCol>
            <FormControl className="m-2" fullWidth>
              <InputLabel>Select Target</InputLabel>
              <Select
                value={target}
                label="Choose Target"
                onChange={(e) => {
                  setTarget(e.target.value);

                  const selectedTarget = e.target.value;
                  if (selectedTarget === "General School") {
                    setSpecificTarget("");
                  }
                }}
              >
                <MenuItem value="General School">General School</MenuItem>
                <MenuItem value="Specific Target">Specific Target</MenuItem>
              </Select>
            </FormControl>
          </MDBCol>
        </MDBRow>

        {target === "Specific Target" && (
          <RadioGroup
            value={specificTarget}
            onChange={(e) => {
              setSpecificTarget(e.target.value);
            }}
          >
            <MDBRow className="m-2" style={{ justifyContent: "flex-start" }}>
              <MDBCol>
                <FormControlLabel
                  value="session"
                  control={<Radio />}
                  label="By Session"
                />
              </MDBCol>
              <MDBCol>
                <FormControlLabel
                  value="department"
                  control={<Radio />}
                  label="By Department"
                />
              </MDBCol>
              <MDBCol>
                <FormControlLabel
                  value="student"
                  control={<Radio />}
                  label="Specific student"
                />
              </MDBCol>
            </MDBRow>
          </RadioGroup>
        )}
      </Paper>

      {specificTarget === "student" && (
        <Paper className="p-2 my-2 w-100">
          <MDBRow className="m-2" style={{ justifyContent: "flex-start" }}>
            <MDBCol>
              <MDBInput
                label="Student ID"
                value={studentId}
                type="text"
                onChange={(e) => {
                  setStudentId(e.target.value);
                }}
                size="lg"
              />
            </MDBCol>
          </MDBRow>
        </Paper>
      )}

      {specificTarget === "session" && (
        <Paper className="p-2 my-2 w-100">
          <MDBRow className="m-2" style={{ justifyContent: "flex-start" }}>
            <MDBCol>
              <FormControl className="m-2" fullWidth>
                <InputLabel>Select Session</InputLabel>
                <Select
                  value={targetSession}
                  label="Choose session"
                  onChange={(e) => {
                    setTargetSession(e.target.value);
                  }}
                >
                  {sessionOfEntry.map((session, index) => (
                    <MenuItem value={session.name} key={index}>
                      {session.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBCol>
          </MDBRow>
        </Paper>
      )}

      {specificTarget === "department" && (
        <Paper className="p-4 my-2 w-100">
          <MDBRow style={{ justifyContent: "flex-start" }}>
            <MDBCol>
              <FormControl fullWidth>
                <InputLabel>Select Entry Session</InputLabel>
                <Select
                  value={deptSession}
                  label="Choose session"
                  onChange={(e) => {
                    setDeptSession(e.target.value);
                  }}
                >
                  {sessionOfEntry.map((session, index) => (
                    <MenuItem value={session.name} key={index}>
                      {session.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBCol>
          </MDBRow>

          <MDBRow>
            <MDBCol>
              <FormControl className="my-2" fullWidth>
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
            <MDBCol>
              <FormControl className="my-2" fullWidth>
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
        </Paper>
      )}

      <div className="cus-button w-25 my-2">Edit Invoice</div>
    </div>
  );
}
