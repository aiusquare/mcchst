import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Paper from "@mui/material/Paper";
import "../../admin/css/style.css";
import {
  MDBCardBody,
  MDBCardText,
  MDBIcon,
} from "mdb-react-ui-kit";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import request from "superagent";
import { useNavigate } from "react-router-dom";
import { admissionProgrammes } from "../../Arrays";

const ROW_BATCH_SIZE = 50;

const normalize = (value) => String(value || "").trim().toLowerCase();

const uniqueSorted = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

const getSession = (student) =>
  student.Session ||
  student.SessionOfEntry ||
  student.AcademicSession ||
  student.SessionAdmitted ||
  "";

const getMatricNumber = (student) =>
  student.MatricNumber || student.MatNumber || student.matric_number || "";

const hasMatricNumber = (student) =>
  Boolean(String(getMatricNumber(student)).trim());

export default function RegisteredStdTab() {
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);
  const loadMoreRef = useRef(null);

  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterProgramme, setFilterProgramme] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterModeOfEntry, setFilterModeOfEntry] = useState("");
  const [visibleCount, setVisibleCount] = useState(ROW_BATCH_SIZE);

  const programmeDepartmentMap = useMemo(() => {
    return admissionProgrammes.reduce((acc, department) => {
      department.programmes.forEach((programme) => {
        acc[programme.programme] = department.department;
      });
      return acc;
    }, {});
  }, []);

  const getStudentDepartment = useCallback(
    (student) =>
      student.Department ||
      programmeDepartmentMap[student.Programme] ||
      programmeDepartmentMap[student.FirstChoiceProgramme] ||
      "",
    [programmeDepartmentMap]
  );

  const handleFetchData = useCallback(async () => {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await request
        .get("https://api.mcchstfuntua.edu.ng/admin/get_admitted.php")
        .type("application/json");

      const admittedStudents = response.body?.list || [];
      setRegisteredStudents(admittedStudents.filter(hasMatricNumber));
    } catch (err) {
      hasFetchedRef.current = false;
      setErrorMessage("Unable to load registered students. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetchData();
  }, [handleFetchData]);

  const filterOptions = useMemo(() => {
    const departments = uniqueSorted(
      registeredStudents.map((student) => getStudentDepartment(student))
    );
    const programmes = uniqueSorted(
      registeredStudents.map((student) => student.Programme)
    );
    const levels = uniqueSorted(
      registeredStudents.map((student) => student.Level)
    );
    const sessions = uniqueSorted(registeredStudents.map(getSession));
    const modesOfEntry = uniqueSorted(
      registeredStudents.map((student) => student.ModeOfEntry)
    );

    return { departments, programmes, levels, sessions, modesOfEntry };
  }, [getStudentDepartment, registeredStudents]);

  const filteredStudents = useMemo(() => {
    const search = normalize(searchText);

    return registeredStudents.filter((student) => {
      const department = getStudentDepartment(student);
      const session = getSession(student);

      const matchesSearch =
        !search ||
        [
          student.ApplicationNo,
          student.AdmissionNumber,
          getMatricNumber(student),
          student.Fullname,
          department,
          student.Programme,
          student.ModeOfEntry,
          student.PhoneNumber,
          student.Email,
          student.Level,
          session,
        ].some((value) => normalize(value).includes(search));

      const matchesDepartment =
        !filterDepartment || department === filterDepartment;
      const matchesProgramme =
        !filterProgramme || student.Programme === filterProgramme;
      const matchesLevel = !filterLevel || student.Level === filterLevel;
      const matchesSession = !filterSession || session === filterSession;
      const matchesModeOfEntry =
        !filterModeOfEntry || student.ModeOfEntry === filterModeOfEntry;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesProgramme &&
        matchesLevel &&
        matchesSession &&
        matchesModeOfEntry
      );
    });
  }, [
    filterDepartment,
    filterLevel,
    filterModeOfEntry,
    filterProgramme,
    filterSession,
    getStudentDepartment,
    registeredStudents,
    searchText,
  ]);

  useEffect(() => {
    setVisibleCount(ROW_BATCH_SIZE);
  }, [
    searchText,
    filterDepartment,
    filterProgramme,
    filterLevel,
    filterSession,
    filterModeOfEntry,
  ]);

  const visibleStudents = useMemo(
    () => filteredStudents.slice(0, visibleCount),
    [filteredStudents, visibleCount]
  );

  const hasMoreRows = visibleCount < filteredStudents.length;

  const loadMoreRows = useCallback(() => {
    setVisibleCount((current) =>
      Math.min(current + ROW_BATCH_SIZE, filteredStudents.length)
    );
  }, [filteredStudents.length]);

  useEffect(() => {
    const marker = loadMoreRef.current;

    if (!marker || !hasMoreRows || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreRows();
      },
      { rootMargin: "160px" }
    );

    observer.observe(marker);

    return () => observer.disconnect();
  }, [hasMoreRows, loadMoreRows]);

  const handleClearFilters = () => {
    setSearchText("");
    setFilterDepartment("");
    setFilterProgramme("");
    setFilterLevel("");
    setFilterSession("");
    setFilterModeOfEntry("");
  };

  const handleStudentProfileLink = (email) => {
    navigate("/student-profile", {
      state: { userEmail: email },
    });
  };

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>Registered Students</h4>
        </MDBCardText>
      </MDBCardBody>

      <Paper className="p-3 mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, matric number, application number, email, phone, programme..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            variant="outlined"
            size="small"
          />

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(5, minmax(0, 1fr))",
              },
              mt: 2,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                onChange={(event) => setFilterDepartment(event.target.value)}
                label="Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                {filterOptions.departments.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Programme</InputLabel>
              <Select
                value={filterProgramme}
                onChange={(event) => setFilterProgramme(event.target.value)}
                label="Programme"
              >
                <MenuItem value="">All Programmes</MenuItem>
                {filterOptions.programmes.map((programme) => (
                  <MenuItem key={programme} value={programme}>
                    {programme}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Level</InputLabel>
              <Select
                value={filterLevel}
                onChange={(event) => setFilterLevel(event.target.value)}
                label="Level"
              >
                <MenuItem value="">All Levels</MenuItem>
                {filterOptions.levels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Session</InputLabel>
              <Select
                value={filterSession}
                onChange={(event) => setFilterSession(event.target.value)}
                label="Session"
              >
                <MenuItem value="">All Sessions</MenuItem>
                {filterOptions.sessions.map((session) => (
                  <MenuItem key={session} value={session}>
                    {session}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Mode of Entry</InputLabel>
              <Select
                value={filterModeOfEntry}
                onChange={(event) => setFilterModeOfEntry(event.target.value)}
                label="Mode of Entry"
              >
                <MenuItem value="">All Modes</MenuItem>
                {filterOptions.modesOfEntry.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {mode}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={handleClearFilters}
              size="small"
            >
              Clear Filters
            </Button>
            <span style={{ color: "#666", fontSize: "14px" }}>
              Showing {visibleStudents.length} of {filteredStudents.length}{" "}
              registered student(s)
            </span>
          </Box>
        </Box>

        {errorMessage ? (
          <Box sx={{ color: "#b00020", py: 4, textAlign: "center" }}>
            {errorMessage}
          </Box>
        ) : (
          <TableContainer sx={{ width: "100%" }}>
            <Table stickyHeader aria-label="registered students table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>SN</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>App No.</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Matric No.</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Fullname</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Programme</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Mode of Entry</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : visibleStudents.length > 0 ? (
                  visibleStudents.map((student, index) => {
                    const department = getStudentDepartment(student);

                    return (
                      <TableRow
                        hover
                        key={`${getMatricNumber(student) || student.Email}-${index}`}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{student.ApplicationNo || "-"}</TableCell>
                        <TableCell>{getMatricNumber(student) || "-"}</TableCell>
                        <TableCell>{student.Fullname || "-"}</TableCell>
                        <TableCell>{department || "-"}</TableCell>
                        <TableCell>{student.Programme || "-"}</TableCell>
                        <TableCell>{student.ModeOfEntry || "-"}</TableCell>
                        <TableCell>
                          <MDBIcon
                            size="lg"
                            fas
                            icon="share"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleStudentProfileLink(student.Email)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      No registered students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && hasMoreRows && !errorMessage && (
          <Box ref={loadMoreRef} sx={{ py: 2, textAlign: "center" }}>
            <Button
              variant="outlined"
              onClick={loadMoreRows}
              size="small"
              sx={{ borderColor: "#05321e", color: "#05321e" }}
            >
              Load more
            </Button>
          </Box>
        )}
      </Paper>
    </div>
  );
}
