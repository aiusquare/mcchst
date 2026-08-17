import Paper from "@mui/material/Paper";
import "../../../admin/css/style.css";
import { admissionProgrammes } from "../../../Arrays";
import { sessionOfEntry } from "../../../Arrays.js";

import {
  MDBBtn,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBIcon,
  MDBInput,
  MDBRow,
} from "mdb-react-ui-kit";

import { useEffect, useRef, useState } from "react";
import request from "superagent";
import { loader } from "../../../LoadingSpinner.js";
import Swal from "sweetalert2";
import { Toast } from "../../../errorNotifier.js";
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from "@mui/material";
import { baseUrl } from "../../../../services/setup.js";

const asText = (value) =>
  value === null || value === undefined ? "" : String(value);

const normalizeSettlementAccount = (row) => {
  const accountNumber = asText(row?.account_number ?? row?.accountNumber);
  const id = asText(
    row?.id ??
      row?.settlement_id ??
      row?.account_id ??
      row?.identifier ??
      accountNumber
  );

  return {
    id,
    accTitle: asText(row?.acc_title ?? row?.account_title ?? row?.accTitle),
    name: asText(row?.name ?? row?.account_name),
    bankName: asText(row?.bank_name ?? row?.bankName),
    accountNumber,
    code: asText(row?.code ?? row?.bank_code ?? row?.settlement_code),
  };
};

const getItemSettlementId = (item) =>
  asText(item?.settlement_account_id ?? item?.settlementAccountId);

const getItemAmount = (item) =>
  parseFloat(item?.Fee ?? item?.amount ?? item?.fee ?? 0) || 0;

const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + getItemAmount(item), 0);

const withSettlementFields = (item, settlementAccount) => ({
  ...item,
  settlementAccountId: settlementAccount.id,
  settlement_account_id: settlementAccount.id,
  settlementAccountTitle: settlementAccount.accTitle,
  settlement_account_title: settlementAccount.accTitle,
  settlementAccountName: settlementAccount.name,
  settlement_account_name: settlementAccount.name,
  settlementBankName: settlementAccount.bankName,
  settlement_bank_name: settlementAccount.bankName,
  settlementAccountNumber: settlementAccount.accountNumber,
  settlement_account_number: settlementAccount.accountNumber,
  settlementCode: settlementAccount.code,
  settlement_code: settlementAccount.code,
});

const mapInvoiceItemsForSubmit = (items) =>
  items.map((item) => ({
    ...item,
    settlement_account_id: getItemSettlementId(item),
    settlement_account_title: asText(
      item?.settlement_account_title ?? item?.settlementAccountTitle
    ),
    settlement_account_name: asText(
      item?.settlement_account_name ?? item?.settlementAccountName
    ),
    settlement_bank_name: asText(
      item?.settlement_bank_name ?? item?.settlementBankName
    ),
    settlement_account_number: asText(
      item?.settlement_account_number ?? item?.settlementAccountNumber
    ),
    settlement_code: asText(item?.settlement_code ?? item?.settlementCode),
  }));

export default function CreateInvoice() {
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
  const [invoicePriorityCode, setInvoicePriorityCode] = useState("");
  const [priority, setPriority] = useState(0);
  const [useExistingCode, setUseExistingCode] = useState(false);
  const [existingCodes, setExistingCodes] = useState([]);
  const [selectedExistingCode, setSelectedExistingCode] = useState("");
  const [totalInvoiceAmount, setTotalInvoiceAmount] = useState(0);
  const [settlementAccounts, setSettlementAccounts] = useState([]);
  const [selectedSettlementAccountId, setSelectedSettlementAccountId] =
    useState("");
  const [loadingSettlementAccounts, setLoadingSettlementAccounts] =
    useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentLookupLoading, setStudentLookupLoading] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const creatingInvoiceRef = useRef(false);

  useEffect(() => {
    const loadExistingCodes = async () => {
      try {
        const response = await request
          .get(baseUrl + "invoices/get_invoice_list/")
          .type("application/json");
        setExistingCodes(Array.isArray(response.body) ? response.body : []);
      } catch (err) {
        console.log("Failed to load invoice codes", err?.response ?? err);
      }
    };

    const loadSettlementAccounts = async () => {
      try {
        setLoadingSettlementAccounts(true);
        const response = await request
          .get(baseUrl + "finance/list_settlement_accounts")
          .type("application/json");
        const responseBody = response.body;
        const rows = Array.isArray(responseBody)
          ? responseBody
          : Array.isArray(responseBody?.data)
          ? responseBody.data
          : Array.isArray(responseBody?.rows)
          ? responseBody.rows
          : [];

        const normalizedAccounts = rows
          .map(normalizeSettlementAccount)
          .filter((account) => account.id !== "");
        setSettlementAccounts(normalizedAccounts);
        if (normalizedAccounts.length > 0) {
          setSelectedSettlementAccountId(normalizedAccounts[0].id);
        }
      } catch (err) {
        console.log("Failed to load settlement accounts", err?.response ?? err);
      } finally {
        setLoadingSettlementAccounts(false);
      }
    };

    loadExistingCodes();
    loadSettlementAccounts();
  }, []);

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
      if (creatingInvoiceRef.current) {
        return;
      }

      creatingInvoiceRef.current = true;
      setCreatingInvoice(true);

      // progress spinner
      loader({
        title: "Creating",
        text: "Please! wait.",
      });

      const incoiceData = {
        invoiceItems: mapInvoiceItemsForSubmit(feesList),
        target: target,
        targetSession: targetSession,
        specificTarget: specificTarget,
        department: department,
        programme: programme,
        programmeCode: programmeCode,
        deptSession: deptSession,
        studentId: studentId,
        invoiceTitle: invoiceTitle,
        invoicePriorityCode: invoicePriorityCode,
        priority: priority,
      };

      try {
        await request
          .post(baseUrl + "invoices/generate_invoice")
          .withCredentials()
          .type("application/json")
          .send(incoiceData)
          .then(() => {
            Toast.fire({
              icon: "success",
              title: "Invoice created successfully",
            });
          })
          .catch((err) => {
            console.log("Error message:", err.response);

            Swal.fire({
              title: "Error!",
              text: "There is occoured an error",
              icon: "error",
            });
          });
      } finally {
        creatingInvoiceRef.current = false;
        setCreatingInvoice(false);
      }
    } else {
      Toast.fire({
        icon: "error",
        title: "No internet connection",
      });
    }
  };

  const searchStudent = async () => {
    if (studentId.trim() === "") {
      Toast.fire({
        icon: "error",
        title: "Enter a student ID/email/matric/app number",
      });
      return;
    }

    try {
      setStudentLookupLoading(true);
      const response = await request
        .post(baseUrl + "invoices/get_student_profile_for_invoice")
        .type("application/json")
        .send({ studentId });

      const data = response.body?.data;
      if (!data) {
        setStudentProfile(null);
        Toast.fire({ icon: "error", title: "Student not found" });
        return;
      }

      setStudentProfile(data);
      if (data.Email) {
        setStudentId(data.Email);
      }

      Toast.fire({ icon: "success", title: "Student found" });
    } catch (err) {
      console.error("Failed to fetch student profile", err?.response ?? err);
      setStudentProfile(null);
      Toast.fire({ icon: "error", title: "Search failed" });
    } finally {
      setStudentLookupLoading(false);
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

    const hasItemWithoutSettlement = feesList.some(
      (item) => getItemSettlementId(item) === ""
    );

    if (hasItemWithoutSettlement) {
      Toast.fire({
        icon: "error",
        title: "Every invoice item must have a settlement account",
      });
      return;
    }

    if (invoiceTitle === "") {
      Toast.fire({
        icon: "error",
        title: "Invoice title is required",
      });
      return;
    }

    if (useExistingCode && selectedExistingCode === "") {
      Toast.fire({
        icon: "error",
        title: "Select an existing invoice code",
      });
      return;
    }

    if (!useExistingCode && invoicePriorityCode === "") {
      Toast.fire({
        icon: "error",
        title: "Invoice priority code is required (e.g., IV001)",
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

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>Create Invoice</h4>
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
        <MDBRow className="mt-3">
          <MDBCol>
            <RadioGroup
              row
              value={useExistingCode ? "existing" : "new"}
              onChange={(e) => {
                const value = e.target.value;
                const isExisting = value === "existing";
                setUseExistingCode(isExisting);
                if (isExisting) {
                  setSelectedExistingCode("");
                  setInvoicePriorityCode("");
                  setPriority(0);
                }
              }}
            >
              <FormControlLabel
                value="new"
                control={<Radio />}
                label="Create new code"
              />
              <FormControlLabel
                value="existing"
                control={<Radio />}
                label="Use existing code"
              />
            </RadioGroup>
          </MDBCol>
        </MDBRow>
        {useExistingCode && (
          <MDBRow className="mt-3">
            <MDBCol>
              <FormControl fullWidth>
                <InputLabel>Select existing code</InputLabel>
                <Select
                  value={selectedExistingCode}
                  label="Select existing code"
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedExistingCode(code);
                    const found = existingCodes.find(
                      (item) => item.invoice_priority_code === code
                    );
                    if (found) {
                      setInvoicePriorityCode(
                        (found.invoice_priority_code || "").toUpperCase()
                      );
                      setPriority(parseInt(found.priority, 10) || 0);
                    }
                  }}
                >
                  {existingCodes.length === 0 && (
                    <MenuItem value="" disabled>
                      No existing codes found
                    </MenuItem>
                  )}
                  {existingCodes.map((item, idx) => (
                    <MenuItem value={item.invoice_priority_code} key={idx}>
                      {item.invoice_priority_code} — Priority{" "}
                      {item.priority ?? 0} — {item.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBCol>
          </MDBRow>
        )}
        <MDBRow className="mt-3">
          <MDBCol>
            <MDBInput
              label="Invoice Priority Code (e.g., IV001, IV002)"
              value={invoicePriorityCode}
              type="text"
              onChange={(e) => {
                setInvoicePriorityCode(e.target.value.toUpperCase());
              }}
              size="lg"
              disabled={useExistingCode}
            />
          </MDBCol>
          <MDBCol>
            <MDBInput
              label="Priority Level (higher = more important)"
              value={priority}
              type="number"
              onChange={(e) => {
                setPriority(parseInt(e.target.value) || 0);
              }}
              size="lg"
              disabled={useExistingCode}
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
          <MDBCol md="4" sm="12" className="mb-2 mb-md-0">
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
          <MDBCol md="3" sm="12" className="mb-2 mb-md-0">
            <div className="d-flex align-items-center h-100">
              <MDBInput
                label="fee amount"
                value={feeAmount}
                type="text"
                onChange={(e) => {
                  setFeeAmount(e.target.value);
                }}
                size="lg"
              />
            </div>
          </MDBCol>
          <MDBCol md="5" sm="12">
            <div className="d-flex align-items-center gap-2">
              <FormControl fullWidth>
                <InputLabel>Settlement Account</InputLabel>
                <Select
                  value={selectedSettlementAccountId}
                  label="Settlement Account"
                  onChange={(e) => {
                    setSelectedSettlementAccountId(e.target.value);
                  }}
                >
                  {loadingSettlementAccounts && (
                    <MenuItem value="" disabled>
                      Loading settlement accounts...
                    </MenuItem>
                  )}
                  {!loadingSettlementAccounts &&
                    settlementAccounts.length === 0 && (
                      <MenuItem value="" disabled>
                        No settlement account found
                      </MenuItem>
                    )}
                  {settlementAccounts.map((account) => (
                    <MenuItem value={account.id} key={account.id}>
                      {account.accTitle || account.name} - {account.bankName} (
                      {account.accountNumber})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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

                  const settlementAccount = settlementAccounts.find(
                    (account) => account.id === selectedSettlementAccountId
                  );

                  if (!settlementAccount) {
                    Toast.fire({
                      icon: "error",
                      title: "Select a settlement account",
                    });
                    return;
                  }

                  const newValue = withSettlementFields(
                    {
                      Description: feeDescription,
                      Fee: feeAmount,
                    },
                    settlementAccount
                  );
                  const updatedRows = [...feesList];
                  updatedRows.push(newValue);
                  setFeesList(updatedRows);
                  setTotalInvoiceAmount(calculateTotal(updatedRows));

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
                  <th style={{ width: "auto" }}>Settlement Account</th>
                  <th style={{ width: "auto" }}>Amount</th>
                  <th style={{ width: "10%" }}>Remove</th>
                </tr>
              </thead>

              <tbody>
                {feesList.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.Description}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={getItemSettlementId(item)}
                          onChange={(e) => {
                            const selectedAccount = settlementAccounts.find(
                              (account) => account.id === e.target.value
                            );
                            if (!selectedAccount) return;

                            const updatedRows = [...feesList];
                            updatedRows[index] = withSettlementFields(
                              updatedRows[index],
                              selectedAccount
                            );
                            setFeesList(updatedRows);
                          }}
                        >
                          <option value="">Select account</option>
                          {settlementAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.accTitle || account.name} -{" "}
                              {account.bankName} ({account.accountNumber})
                            </option>
                          ))}
                        </select>
                      </td>
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

                              setTotalInvoiceAmount(calculateTotal(updatedRows));
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
                <tr>
                  {/* <td className="fw-bold"></td> */}
                  <td colSpan={3} className="fw-bold text-end text-size-5">
                    Total:
                  </td>
                  <td> ₦{(parseFloat(totalInvoiceAmount) || 0).toFixed(2)}</td>
                </tr>
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
            <MDBCol md="8" sm="12" className="mb-2 mb-md-0">
              <MDBInput
                label="Student ID / Email / Matric / App No"
                value={studentId}
                type="text"
                onChange={(e) => {
                  setStudentId(e.target.value);
                }}
                size="lg"
              />
            </MDBCol>
            <MDBCol
              md="4"
              sm="12"
              className="d-flex align-items-center justify-content-start"
            >
              <MDBBtn
                color="dark"
                className="w-100"
                disabled={studentLookupLoading}
                onClick={searchStudent}
              >
                {studentLookupLoading ? "Searching..." : "Search"}
              </MDBBtn>
            </MDBCol>
          </MDBRow>

          {studentProfile && (
            <div
              className="mt-2 p-3"
              style={{ background: "#f6f6f6", borderRadius: "8px" }}
            >
              <div style={{ fontWeight: "bold" }}>Student details</div>
              <div>Name: {studentProfile.Fullname || "N/A"}</div>
              <div>Email: {studentProfile.Email || "N/A"}</div>
              <div>
                Programme: {studentProfile.Programme || "N/A"} (
                {studentProfile.ProgrammeCode || ""})
              </div>
              <div>Department: {studentProfile.Department || "N/A"}</div>
              <div>
                Session: {studentProfile.SessionOfEntry || "N/A"} • Level:{" "}
                {studentProfile.Level || "N/A"}
              </div>
              <div>
                Matric: {studentProfile.MatricNumber || "N/A"} • App No:{" "}
                {studentProfile.ApplicationNo || "N/A"}
              </div>
            </div>
          )}
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

      <div
        onClick={creatingInvoice ? undefined : handleCreateInvoice}
        className="cus-button w-25 my-2"
        aria-disabled={creatingInvoice}
        style={{
          opacity: creatingInvoice ? 0.65 : 1,
          pointerEvents: creatingInvoice ? "none" : "auto",
        }}
      >
        {creatingInvoice ? "Creating Invoice..." : "Create Invoice"}
      </div>
    </div>
  );
}
