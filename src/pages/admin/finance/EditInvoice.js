import Paper from "@mui/material/Paper";
import {
  MDBBtn,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBIcon,
  MDBInput,
  MDBRow,
} from "mdb-react-ui-kit";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const asText = (value) =>
  value === null || value === undefined ? "" : String(value);

const normalizeSettlementAccount = (row) => {
  const accountNumber = asText(row?.account_number ?? row?.accountNumber);
  const id = asText(
    row?.id ??
      row?.settlement_id ??
      row?.account_id ??
      row?.identifier ??
      accountNumber,
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

const normalizeInvoiceItem = (item) => {
  const normalized = {
    ...item,
    description: asText(item?.description ?? item?.Description),
    Description: asText(item?.Description ?? item?.description),
    amount: asText(item?.amount ?? item?.Fee),
    Fee: asText(item?.Fee ?? item?.amount),
  };

  const settlementId = getItemSettlementId(item);
  if (settlementId !== "") {
    normalized.settlement_account_id = settlementId;
    normalized.settlementAccountId = settlementId;
  }

  return normalized;
};

const mapInvoiceItemsForSubmit = (items) =>
  items.map((item) => ({
    ...item,
    description: asText(item?.description ?? item?.Description),
    amount: asText(item?.amount ?? item?.Fee),
    settlement_account_id: getItemSettlementId(item),
    settlement_account_title: asText(
      item?.settlement_account_title ?? item?.settlementAccountTitle,
    ),
    settlement_account_name: asText(
      item?.settlement_account_name ?? item?.settlementAccountName,
    ),
    settlement_bank_name: asText(
      item?.settlement_bank_name ?? item?.settlementBankName,
    ),
    settlement_account_number: asText(
      item?.settlement_account_number ?? item?.settlementAccountNumber,
    ),
    settlement_code: asText(item?.settlement_code ?? item?.settlementCode),
  }));

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
  const [invoiceCode, setInvoiceCode] = useState("");
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
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [invoiceMode, setInvoiceMode] = useState("");

  const isPaidInvoice = useMemo(
    () => invoiceStatus.toLowerCase() === "paid",
    [invoiceStatus],
  );
  const isCanceledInvoice = useMemo(
    () => invoiceMode.toLowerCase() === "canceled",
    [invoiceMode],
  );
  const canEditFinancialDetails = !isPaidInvoice && !isCanceledInvoice;

  const handleDepartmentChange = useCallback((e) => {
    const selectedDept = e.target.value;
    setDepartment(selectedDept);
    const departmentData = admissionProgrammes.find(
      (dept) => dept.department === selectedDept,
    );

    if (!departmentData || !departmentData.programmes?.length) {
      setProgrammesList([]);
      setProgramme("");
      setProgrammeCode("");
      return;
    }

    setProgrammesList(departmentData.programmes);
    const defaultProgramme = departmentData.programmes[0];
    setProgramme(defaultProgramme.programme);
    setProgrammeCode(defaultProgramme.programmeCode);
  }, []);

  const handleProgrammeChange = useCallback(
    (e) => {
      const selectedProgramme = e.target.value;
      setProgramme(selectedProgramme);
      const retProgramme = programmesList.find(
        (item) => item.programme === selectedProgramme,
      );
      if (retProgramme) {
        setProgrammeCode(retProgramme.programmeCode);
      }
    },
    [programmesList],
  );

  const submitInvoice = useCallback(async () => {
    if (!navigator.onLine) {
      Toast.fire({ icon: "error", title: "No internet connection" });
      return;
    }

    loader({ title: "Updating", text: "Please wait." });

    const invoiceData = {
      invoiceItems: mapInvoiceItemsForSubmit(feesList),
      target,
      targetSession,
      specificTarget,
      department,
      programme,
      programmeCode,
      deptSession,
      studentId,
      invoiceTitle,
      invoiceCode,
      invoicePriorityCode,
      priority,
    };

    try {
      const response = await request
        .post(baseUrl + "invoices/edit_invoice")
        .withCredentials()
        .type("application/json")
        .send(invoiceData);

      Toast.fire({
        icon: "success",
        title: response.body?.message || "Invoice updated successfully",
      });
    } catch (err) {
      const errorData = err.response?.body;
      const details = Array.isArray(errorData?.details)
        ? errorData.details.join("\n")
        : errorData?.details?.reason;
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        details ||
        "There was an error updating the invoice";

      Swal.fire({ title: "Error!", text: errorMessage, icon: "error" });
    }
  }, [
    feesList,
    target,
    targetSession,
    specificTarget,
    department,
    programme,
    programmeCode,
    deptSession,
    studentId,
    invoiceTitle,
    invoiceCode,
    invoicePriorityCode,
    priority,
  ]);

  const handleSubmit = useCallback(() => {
    if (isCanceledInvoice) {
      Toast.fire({ icon: "error", title: "Canceled invoices cannot be edited" });
      return;
    }

    if (!invoiceTitle.trim()) {
      Toast.fire({ icon: "error", title: "Invoice title is required" });
      return;
    }

    if (isPaidInvoice) {
      submitInvoice();
      return;
    }

    if (feesList.length === 0) {
      Toast.fire({ icon: "error", title: "No fees added" });
      return;
    }

    const hasItemWithoutSettlement = feesList.some(
      (item) => getItemSettlementId(item) === "",
    );
    if (hasItemWithoutSettlement) {
      Toast.fire({
        icon: "error",
        title: "Every invoice item must have a settlement account",
      });
      return;
    }

    if (!target) {
      Toast.fire({ icon: "error", title: "Target not selected" });
      return;
    }

    if (target === "Specific Target") {
      if (!specificTarget) {
        Toast.fire({ icon: "error", title: "Specific target not selected" });
        return;
      }
      if (specificTarget === "session" && !targetSession) {
        Toast.fire({ icon: "error", title: "Session not selected" });
        return;
      }
      if (specificTarget === "department") {
        if (!deptSession) {
          Toast.fire({ icon: "error", title: "Session not selected" });
          return;
        }
        if (!department) {
          Toast.fire({ icon: "error", title: "Department not selected" });
          return;
        }
        if (!programme) {
          Toast.fire({ icon: "error", title: "Programme not selected" });
          return;
        }
      }
      if (specificTarget === "student" && !studentId) {
        Toast.fire({ icon: "error", title: "Student ID not provided" });
        return;
      }
    }

    submitInvoice();
  }, [
    department,
    deptSession,
    feesList,
    invoiceTitle,
    isCanceledInvoice,
    isPaidInvoice,
    programme,
    specificTarget,
    studentId,
    submitInvoice,
    target,
    targetSession,
  ]);

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
        const body = response.body;
        const rows = Array.isArray(body)
          ? body
          : Array.isArray(body?.data)
            ? body.data
            : Array.isArray(body?.rows)
              ? body.rows
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

  useEffect(() => {
    const invoiceData = location.state?.invoiceData;
    if (!invoiceData) return;

    const {
      title,
      target: invoiceTarget,
      target_type,
      target_id,
      sessionOfEntry,
      department: invDepartment,
      programme: invProgramme,
      programmeCode: invProgrammeCode,
      studentId: invStudentId,
      invoice_code,
      invoice_priority_code,
      priority: invPriority,
      status,
      mode,
    } = invoiceData;

    const fetchFeesList = async () => {
      const invoiceItems = await postData(
        baseUrl + "invoices/get_invoice_items_by_id/",
        { invoiceId: invoice_code },
      );
      if (invoiceItems) {
        const normalizedItems = invoiceItems.map(normalizeInvoiceItem);
        setFeesList(normalizedItems);
        setTotalInvoiceAmount(calculateTotal(normalizedItems));
      }
    };

    fetchFeesList();
    setInvoiceTitle(title || "");
    setInvoiceCode(invoice_code || "");
    setInvoicePriorityCode(invoice_priority_code || "");
    setPriority(parseInt(invPriority, 10) || 0);
    setInvoiceStatus(status || "");
    setInvoiceMode(mode || "");

    const resolvedTargetType =
      target_type ||
      (invoiceTarget === "general"
        ? "general"
        : target_id
          ? "student"
          : invProgramme
            ? "department"
            : sessionOfEntry
              ? "session"
              : "general");

    if (resolvedTargetType === "general") {
      setTarget("General School");
      return;
    }

    setTarget("Specific Target");
    setSpecificTarget(resolvedTargetType);

    if (resolvedTargetType === "department") {
      const departmentData = admissionProgrammes.find(
        (dept) => dept.department === invDepartment,
      );
      setProgrammesList(departmentData?.programmes || []);
      setDepartment(invDepartment || "");
      setProgramme(invProgramme || "");
      setProgrammeCode(invProgrammeCode || "");
      setDeptSession(sessionOfEntry || "");
    } else if (resolvedTargetType === "session") {
      setTargetSession(sessionOfEntry || "");
    } else if (resolvedTargetType === "student") {
      setStudentId(target_id || invStudentId || "");
    }
  }, [location.state]);

  const addItem = () => {
    if (!canEditFinancialDetails) return;

    if (!feeDescription || !feeAmount) {
      Toast.fire({ icon: "error", title: "Both fields must be provided" });
      return;
    }

    const settlementAccount = settlementAccounts.find(
      (account) => account.id === selectedSettlementAccountId,
    );
    if (!settlementAccount) {
      Toast.fire({ icon: "error", title: "Select a settlement account" });
      return;
    }

    const updatedRows = [
      ...feesList,
      withSettlementFields(
        { description: feeDescription, amount: feeAmount },
        settlementAccount,
      ),
    ];
    setFeesList(updatedRows);
    setTotalInvoiceAmount(calculateTotal(updatedRows));
    setFeeDescription("");
    setFeeAmount("");
  };

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>Edit Invoice</h4>
        </MDBCardText>
      </MDBCardBody>

      {isPaidInvoice && (
        <Paper className="p-3 my-2 w-100">
          <div className="text-warning fw-bold">
            This invoice has received payment. Only title, priority code, and
            priority can be edited.
          </div>
        </Paper>
      )}

      <Paper className="p-2 my-2 w-100">
        <MDBRow>
          <MDBCol>
            <MDBInput
              label="Invoice Title"
              value={invoiceTitle}
              type="text"
              onChange={(e) => setInvoiceTitle(e.target.value)}
              size="lg"
              disabled={isCanceledInvoice}
            />
          </MDBCol>
        </MDBRow>
        <MDBRow className="mt-3">
          <MDBCol md="4">
            <FormControl fullWidth>
              <RadioGroup
                row
                value={useExistingCode ? "existing" : "new"}
                onChange={(e) => {
                  const val = e.target.value === "existing";
                  setUseExistingCode(val);
                  if (!val) setSelectedExistingCode("");
                }}
              >
                <FormControlLabel
                  value="new"
                  control={<Radio disabled={isCanceledInvoice} />}
                  label="New code"
                />
                <FormControlLabel
                  value="existing"
                  control={<Radio disabled={isCanceledInvoice} />}
                  label="Use existing"
                />
              </RadioGroup>
            </FormControl>
            {useExistingCode && (
              <FormControl fullWidth className="mt-2">
                <InputLabel>Select existing code</InputLabel>
                <Select
                  value={selectedExistingCode}
                  label="Select existing code"
                  disabled={isCanceledInvoice}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedExistingCode(code);
                    const found = existingCodes.find(
                      (item) => item.invoice_priority_code === code,
                    );
                    if (found) {
                      setInvoicePriorityCode(
                        (found.invoice_priority_code || "").toUpperCase(),
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
                      {item.invoice_priority_code} - Priority{" "}
                      {item.priority ?? 0} - {item.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </MDBCol>
          <MDBCol md="4">
            <MDBInput
              label="Invoice Priority Code"
              value={invoicePriorityCode}
              type="text"
              onChange={(e) =>
                setInvoicePriorityCode(e.target.value.toUpperCase())
              }
              size="lg"
              disabled={useExistingCode || isCanceledInvoice}
            />
          </MDBCol>
          <MDBCol md="4">
            <MDBInput
              label="Priority (higher = more important)"
              value={priority}
              type="number"
              onChange={(e) => setPriority(e.target.value)}
              size="lg"
              disabled={useExistingCode || isCanceledInvoice}
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
              onChange={(e) => setFeeDescription(e.target.value)}
              size="lg"
              disabled={!canEditFinancialDetails}
            />
          </MDBCol>
          <MDBCol md="3" sm="12" className="mb-2 mb-md-0">
            <MDBInput
              label="fee amount"
              value={feeAmount}
              type="text"
              onChange={(e) => setFeeAmount(e.target.value)}
              size="lg"
              disabled={!canEditFinancialDetails}
            />
          </MDBCol>
          <MDBCol md="5" sm="12">
            <div className="d-flex align-items-center gap-2">
              <FormControl fullWidth>
                <InputLabel>Settlement Account</InputLabel>
                <Select
                  value={selectedSettlementAccountId}
                  label="Settlement Account"
                  disabled={!canEditFinancialDetails}
                  onChange={(e) => setSelectedSettlementAccountId(e.target.value)}
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
                disabled={!canEditFinancialDetails}
                onClick={addItem}
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
                  <th>Description</th>
                  <th>Settlement Account</th>
                  <th>Amount</th>
                  <th style={{ width: "10%" }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {feesList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.Description ?? item.description}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={getItemSettlementId(item)}
                        disabled={!canEditFinancialDetails}
                        onChange={(e) => {
                          const selectedAccount = settlementAccounts.find(
                            (account) => account.id === e.target.value,
                          );
                          if (!selectedAccount) return;

                          const updatedRows = [...feesList];
                          updatedRows[index] = withSettlementFields(
                            updatedRows[index],
                            selectedAccount,
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
                    <td>NGN {item.Fee ?? item.amount}</td>
                    <td style={{ textAlign: "center" }}>
                      <MDBIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!canEditFinancialDetails) return;
                          const updatedRows = feesList.filter(
                            (_, i) => i !== index,
                          );
                          setFeesList(updatedRows);
                          setTotalInvoiceAmount(calculateTotal(updatedRows));
                        }}
                        className="zindex-alert fa-sm"
                        style={{
                          cursor: canEditFinancialDetails
                            ? "pointer"
                            : "not-allowed",
                          color: canEditFinancialDetails ? "black" : "#aaa",
                        }}
                        fas
                        icon="trash"
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="fw-bold text-end text-size-5">
                    Total:
                  </td>
                  <td>NGN {(parseFloat(totalInvoiceAmount) || 0).toFixed(2)}</td>
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
                disabled={!canEditFinancialDetails}
                onChange={(e) => {
                  setTarget(e.target.value);
                  if (e.target.value === "General School") {
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
            onChange={(e) => setSpecificTarget(e.target.value)}
          >
            <MDBRow className="m-2" style={{ justifyContent: "flex-start" }}>
              <MDBCol>
                <FormControlLabel
                  value="session"
                  control={<Radio disabled={!canEditFinancialDetails} />}
                  label="By Session"
                />
              </MDBCol>
              <MDBCol>
                <FormControlLabel
                  value="department"
                  control={<Radio disabled={!canEditFinancialDetails} />}
                  label="By Department"
                />
              </MDBCol>
              <MDBCol>
                <FormControlLabel
                  value="student"
                  control={<Radio disabled={!canEditFinancialDetails} />}
                  label="Specific student"
                />
              </MDBCol>
            </MDBRow>
          </RadioGroup>
        )}
      </Paper>

      {specificTarget === "student" && (
        <Paper className="p-2 my-2 w-100">
          <MDBInput
            label="Student ID"
            value={studentId}
            type="text"
            onChange={(e) => setStudentId(e.target.value)}
            size="lg"
            disabled={!canEditFinancialDetails}
          />
        </Paper>
      )}

      {specificTarget === "session" && (
        <Paper className="p-2 my-2 w-100">
          <FormControl className="m-2" fullWidth>
            <InputLabel>Select Session</InputLabel>
            <Select
              value={targetSession}
              label="Choose session"
              disabled={!canEditFinancialDetails}
              onChange={(e) => setTargetSession(e.target.value)}
            >
              {sessionOfEntry.map((session, index) => (
                <MenuItem value={session.name} key={index}>
                  {session.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {specificTarget === "department" && (
        <Paper className="p-4 my-2 w-100">
          <MDBRow>
            <MDBCol>
              <FormControl fullWidth>
                <InputLabel>Select Entry Session</InputLabel>
                <Select
                  value={deptSession}
                  label="Choose session"
                  disabled={!canEditFinancialDetails}
                  onChange={(e) => setDeptSession(e.target.value)}
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
                  disabled={!canEditFinancialDetails}
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
                  disabled={!canEditFinancialDetails}
                  onChange={handleProgrammeChange}
                >
                  {programmesList.map((item, index) => (
                    <MenuItem value={item.programme} key={index}>
                      {item.programme}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBCol>
          </MDBRow>
        </Paper>
      )}

      <div
        className="cus-button w-25 my-2"
        onClick={handleSubmit}
        style={{
          cursor: isCanceledInvoice ? "not-allowed" : "pointer",
          opacity: isCanceledInvoice ? 0.6 : 1,
        }}
      >
        {isPaidInvoice ? "Update Metadata" : "Edit Invoice"}
      </div>
    </div>
  );
}
