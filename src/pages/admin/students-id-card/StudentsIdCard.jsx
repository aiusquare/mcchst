import React, { useEffect, useState, useCallback } from "react";
import Paper from "@mui/material/Paper";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  MDBBtn,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBRow,
  MDBIcon,
} from "mdb-react-ui-kit";
import { MuiFileInput } from "mui-file-input";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import request from "superagent";
import Swal from "sweetalert2";
import { Toast } from "../../../components/errorNotifier";
import {
  admissionProgrammes,
  entryMode,
  sessionOfEntry,
} from "../../../components/Arrays";
import { baseUrl } from "../../../services/setup";

const API = `${baseUrl}id_card`;

// ── helpers ──────────────────────────────────────────────────────────────────

/** Build a CSV string and trigger browser download */
function downloadAsCsv(rows) {
  const headers = [
    "Fullname",
    "Department",
    "Programme",
    "MatricNumber",
    "Gender",
    "DoB",
    "PhoneNumber",
    "State",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const value = r[h] ?? r[h.toLowerCase()] ?? "";

          if (h === "PhoneNumber") {
            return `="${value}"`;
          }

          return `"${value.toString().replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ];

  const blob = new Blob([lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students_id_card_data.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── component ─────────────────────────────────────────────────────────────────

export default function StudentsIdCard() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  // filter state
  const [filterDept, setFilterDept] = useState("");
  const [filterProg, setFilterProg] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterMode, setFilterMode] = useState("");

  // Derived programme list for selected department
  const departmentOptions = admissionProgrammes.map((d) => d.department);
  const programmeOptions = filterDept
    ? (
        admissionProgrammes.find((d) => d.department === filterDept)
          ?.programmes ?? []
      ).map((p) => p.programme)
    : admissionProgrammes.flatMap((d) => d.programmes.map((p) => p.programme));

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDept) params.department = filterDept;
      if (filterProg) params.programme = filterProg;
      if (filterSession) params.session = filterSession;
      if (filterMode) params.mode = filterMode;

      const res = await request.get(`${API}/students`).query(params);
      const data = res.body?.data ?? [];
      setStudents(data);
      setFiltered(data);
    } catch (err) {
      Toast.fire({ icon: "error", title: "Failed to load students" });
    } finally {
      setLoading(false);
    }
  }, [filterDept, filterProg, filterSession, filterMode]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Reset programme filter when department changes
  useEffect(() => {
    setFilterProg("");
  }, [filterDept]);

  // ── toggle single status ──────────────────────────────────────────────────
  const handleToggleStatus = async (student) => {
    const newStatus = student.id_card_status === "done" ? "pending" : "done";
    // Optimistic update
    const update = (list) =>
      list.map((s) =>
        s.MatricNumber === student.MatricNumber
          ? { ...s, id_card_status: newStatus }
          : s,
      );
    setStudents((prev) => update(prev));
    setFiltered((prev) => update(prev));

    try {
      await request
        .post(`${API}/update_status`)
        .type("application/json")
        .send({ matric_number: student.MatricNumber, status: newStatus });
    } catch {
      // Revert on failure
      const revert = (list) =>
        list.map((s) =>
          s.MatricNumber === student.MatricNumber
            ? { ...s, id_card_status: student.id_card_status }
            : s,
        );
      setStudents((prev) => revert(prev));
      setFiltered((prev) => revert(prev));
      Toast.fire({ icon: "error", title: "Failed to update status" });
    }
  };

  // ── CSV upload ────────────────────────────────────────────────────────────
  const handleCsvUpload = async () => {
    if (!csvFile) {
      Toast.fire({ icon: "warning", title: "Please select a CSV file first" });
      return;
    }

    setUploading(true);
    try {
      const res = await request
        .post(`${API}/upload_csv`)
        .attach("csv", csvFile, csvFile.name);

      Swal.fire({
        icon: "success",
        title: "Upload Successful",
        text: res.body?.message ?? "Students marked as done",
      });
      setCsvFile(null);
      fetchStudents();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.response?.body?.message ?? "An error occurred",
      });
    } finally {
      setUploading(false);
    }
  };

  // ── stats ─────────────────────────────────────────────────────────────────
  const doneCount = filtered.filter((s) => s.id_card_status === "done").length;
  const pendingCount = filtered.length - doneCount;

  return (
    <div className="m-4">
      <MDBCardBody>
        <MDBCardText>
          <h4>Students ID Card</h4>
          <p className="text-muted mb-0">
            Filter the list, download data as CSV for printing, and mark cards
            as done.
          </p>
        </MDBCardText>
      </MDBCardBody>

      {/* ── Filters ── */}
      <Paper className="p-3 mb-3" elevation={2}>
        <h6 className="mb-3 fw-bold">Filters</h6>
        <MDBRow className="g-2">
          <MDBCol md="3">
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDept}
                label="Department"
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departmentOptions.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBCol>

          <MDBCol md="3">
            <FormControl fullWidth size="small">
              <InputLabel>Programme</InputLabel>
              <Select
                value={filterProg}
                label="Programme"
                onChange={(e) => setFilterProg(e.target.value)}
              >
                <MenuItem value="">All Programmes</MenuItem>
                {programmeOptions.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBCol>

          <MDBCol md="3">
            <FormControl fullWidth size="small">
              <InputLabel>Session</InputLabel>
              <Select
                value={filterSession}
                label="Session"
                onChange={(e) => setFilterSession(e.target.value)}
              >
                <MenuItem value="">All Sessions</MenuItem>
                {sessionOfEntry.map((s) => (
                  <MenuItem key={s.name} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBCol>

          <MDBCol md="3">
            <FormControl fullWidth size="small">
              <InputLabel>Mode of Entry</InputLabel>
              <Select
                value={filterMode}
                label="Mode of Entry"
                onChange={(e) => setFilterMode(e.target.value)}
              >
                <MenuItem value="">All Modes</MenuItem>
                {entryMode.map((m) => (
                  <MenuItem key={m.code} value={m.name}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBCol>
        </MDBRow>

        <div className="mt-3 d-flex gap-2 flex-wrap align-items-center">
          <MDBBtn
            color="primary"
            size="sm"
            onClick={fetchStudents}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={14} color="inherit" className="me-1" />
            ) : (
              <MDBIcon fas icon="search" className="me-1" />
            )}
            Apply Filters
          </MDBBtn>

          <MDBBtn
            color="secondary"
            size="sm"
            outline
            onClick={() => {
              setFilterDept("");
              setFilterProg("");
              setFilterSession("");
              setFilterMode("");
            }}
          >
            <MDBIcon fas icon="times" className="me-1" />
            Clear
          </MDBBtn>

          {/* stats */}
          {filtered.length > 0 && (
            <div className="ms-auto d-flex gap-2">
              <Chip
                label={`Total: ${filtered.length}`}
                color="default"
                size="small"
              />
              <Chip
                label={`Done: ${doneCount}`}
                color="success"
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Pending: ${pendingCount}`}
                color="warning"
                size="small"
                variant="outlined"
              />
            </div>
          )}
        </div>
      </Paper>

      {/* ── Actions ── */}
      <Paper className="p-3 mb-3" elevation={2}>
        <h6 className="mb-3 fw-bold">Actions</h6>
        <MDBRow className="g-2 align-items-end">
          <MDBCol md="auto">
            <MDBBtn
              color="success"
              size="sm"
              onClick={() => downloadAsCsv(filtered)}
              disabled={filtered.length === 0}
            >
              <MDBIcon fas icon="download" className="me-1" />
              Download CSV ({filtered.length})
            </MDBBtn>
          </MDBCol>

          <MDBCol md="4">
            <MuiFileInput
              value={csvFile}
              onChange={setCsvFile}
              placeholder="Upload CSV to mark done"
              size="small"
              inputProps={{ accept: ".csv" }}
              InputProps={{
                startAdornment: <AttachFileIcon fontSize="small" />,
              }}
              clearIconButtonProps={{
                title: "Remove",
                children: <CloseIcon fontSize="small" />,
              }}
              fullWidth
            />
          </MDBCol>

          <MDBCol md="auto">
            <MDBBtn
              color="warning"
              size="sm"
              onClick={handleCsvUpload}
              disabled={!csvFile || uploading}
            >
              {uploading ? (
                <CircularProgress size={14} color="inherit" className="me-1" />
              ) : (
                <MDBIcon fas icon="upload" className="me-1" />
              )}
              Mark Done from CSV
            </MDBBtn>
          </MDBCol>

          <MDBCol md="12" className="mt-1">
            <small className="text-muted">
              CSV format for upload: first column must be{" "}
              <strong>MatricNumber</strong> (with a header row).
            </small>
          </MDBCol>
        </MDBRow>
      </Paper>

      {/* ── Table ── */}
      <Paper elevation={2} sx={{ width: "100%", overflow: "hidden" }}>
        {loading ? (
          <div className="text-center p-5">
            <CircularProgress />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f0f4ff",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th style={thStyle}>SN</th>
                  <th style={thStyle}>Fullname</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Programme</th>
                  <th style={thStyle}>Matric No.</th>
                  <th style={thStyle}>Session</th>
                  <th style={thStyle}>Mode</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>
                    ID Card Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#888",
                      }}
                    >
                      No students found. Adjust the filters and click
                      &quot;Apply Filters&quot;.
                    </td>
                  </tr>
                ) : (
                  filtered.map((student, i) => {
                    const isDone = student.id_card_status === "done";
                    return (
                      <tr
                        key={student.MatricNumber || i}
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          background: i % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        <td style={tdStyle}>{i + 1}</td>
                        <td style={tdStyle}>{student.Fullname}</td>
                        <td style={tdStyle}>{student.Department}</td>
                        <td style={tdStyle}>{student.Programme}</td>
                        <td style={{ ...tdStyle, fontFamily: "monospace" }}>
                          {student.MatricNumber || "—"}
                        </td>
                        <td style={tdStyle}>{student.SessionOfEntry}</td>
                        <td style={tdStyle}>{student.ModeOfEntry}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <Tooltip
                            title={
                              isDone
                                ? "Click to mark Pending"
                                : "Click to mark Done"
                            }
                          >
                            <span
                              onClick={() => handleToggleStatus(student)}
                              style={{ cursor: "pointer" }}
                            >
                              <Chip
                                label={isDone ? "Done" : "Pending"}
                                color={isDone ? "success" : "warning"}
                                size="small"
                                icon={
                                  isDone ? (
                                    <MDBIcon fas icon="check-circle" />
                                  ) : (
                                    <MDBIcon fas icon="clock" />
                                  )
                                }
                                clickable
                              />
                            </span>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Paper>
    </div>
  );
}

const thStyle = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "8px 12px",
  verticalAlign: "middle",
};
