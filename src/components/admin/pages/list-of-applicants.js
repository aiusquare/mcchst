import * as React from "react";
import Paper from "@mui/material/Paper";
import "../../admin/css/style.css";
import { MDBCardBody, MDBCardText, MDBCol, MDBRow } from "mdb-react-ui-kit";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
} from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import request from "superagent";
import { downloadExcel } from "react-export-table-to-excel";

export default function ListOfApplicantsPage() {
  const [rows, setRows] = useState([]);
  const [init, setInit] = useState(false);

  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  
  // Filter states
  const [searchText, setSearchText] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterLGA, setFilterLGA] = useState("");
  const [filterProgramme, setFilterProgramme] = useState("");
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Unique filter values
  const [uniqueSessions, setUniqueSessions] = useState([]);
  const [uniqueStates, setUniqueStates] = useState([]);
  const [uniqueLGAs, setUniqueLGAs] = useState([]);
  const [uniqueProgrammes, setUniqueProgrammes] = useState([]);

  const columns = [
    { id: "sn", label: "SN" },
    { id: "refrance", label: "Applicant ID" },
    { id: "ApplicantName", label: "Applicant name" },
    { id: "ApplicantNumber", label: "Phone number" },
    { id: "totalDiscount", label: "Applicant email" },
    { id: "State", label: "State" },
    { id: "LGA", label: "LGA" },
    { id: "FirstChoice", label: "First choice" },
    { id: "Session", label: "Session" },
  ];

  useEffect(() => {
    handleDataFetch();
  }, []);

  // Extract unique filter values and apply filters
  useEffect(() => {
    if (applicants.length > 0) {
      // Extract unique values
      const sessions = [...new Set(applicants.map(a => a.SessionOfEntry).filter(Boolean))].sort();
      const states = [...new Set(applicants.map(a => a.State).filter(Boolean))].sort();
      const lgas = [...new Set(applicants.map(a => a.LGA).filter(Boolean))].sort();
      const programmes = [...new Set(applicants.map(a => a.FirstChoiceProgramme).filter(Boolean))].sort();

      setUniqueSessions(sessions);
      setUniqueStates(states);
      setUniqueLGAs(lgas);
      setUniqueProgrammes(programmes);

      // Apply filters
      applyFilters();
    }
  }, [applicants, searchText, filterSession, filterState, filterLGA, filterProgramme]);

  const applyFilters = () => {
    let filtered = applicants;

    // Text search - search across multiple fields
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(app =>
        (app.FirstName?.toLowerCase().includes(search)) ||
        (app.Surname?.toLowerCase().includes(search)) ||
        (app.Email?.toLowerCase().includes(search)) ||
        (app.ApplicationId?.toLowerCase().includes(search)) ||
        (app.PhoneNumber?.includes(search))
      );
    }

    // Session filter
    if (filterSession) {
      filtered = filtered.filter(app => app.SessionOfEntry === filterSession);
    }

    // State filter
    if (filterState) {
      filtered = filtered.filter(app => app.State === filterState);
    }

    // LGA filter
    if (filterLGA) {
      filtered = filtered.filter(app => app.LGA === filterLGA);
    }

    // Programme filter
    if (filterProgramme) {
      filtered = filtered.filter(app => app.FirstChoiceProgramme === filterProgramme);
    }

    setFilteredApplicants(filtered);
    setPage(0); // Reset to first page when filtering
  };

  const handleDataFetch = async () => {
    try {
      const basicResponse = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/application/list/index.php"
      );
      const basicDetails = basicResponse.body;

      console.log("THE LIST OF APPLICANTS: ", basicDetails);
      setApplicants(basicDetails || []);
      setInit(true);
    } catch (err) {
      console.error("Error fetching data: ", err);
    }
  };

  const handleClearFilters = () => {
    setSearchText("");
    setFilterSession("");
    setFilterState("");
    setFilterLGA("");
    setFilterProgramme("");
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Get current page data
  const currentPageData = filteredApplicants.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDownloadFiltered = () => {
    if (filteredApplicants.length === 0) {
      alert("No applicants to download. Apply filters or check data.");
      return;
    }

    // Construct data with all available columns
    const downloadData = filteredApplicants.map((applicant, index) => ({
      "SN": index + 1,
      "Application ID": applicant.ApplicationId || "-",
      "First Name": applicant.FirstName || "-",
      "Surname": applicant.Surname || "-",
      "Other Name": applicant.OtherName || "-",
      "Email": applicant.Email || "-",
      "Phone Number": applicant.PhoneNumber || "-",
      "State": applicant.State || "-",
      "LGA": applicant.LGA || "-",
      "Session of Entry": applicant.SessionOfEntry || "-",
      "First Choice Programme": applicant.FirstChoiceProgramme || "-",
      "Second Choice Programme": applicant.SecondChoiceProgramme || "-",
      "Gender": applicant.Gender || "-",
      "Date of Birth": applicant.DoB || "-",
      "Address": applicant.Address || "-",
      "Marital Status": applicant.MaritalStatus || "-",
      "Religion": applicant.Religion || "-",
      "Parent/Guardian Phone": applicant.ParentOrGuardianPhone || "-",
      "Programme": applicant.Programme || "-",
      "Level": applicant.Level || "-",
      "Department": applicant.Department || "-",
      "Matric Number": applicant.MatricNumber || "-",
    }));

    const headers = [
      "SN",
      "Application ID",
      "First Name",
      "Surname",
      "Other Name",
      "Email",
      "Phone Number",
      "State",
      "LGA",
      "Session of Entry",
      "First Choice Programme",
      "Second Choice Programme",
      "Gender",
      "Date of Birth",
      "Address",
      "Marital Status",
      "Religion",
      "Parent/Guardian Phone",
      "Programme",
      "Level",
      "Department",
      "Matric Number",
    ];

    const timestamp = new Date().toLocaleString().replace(/[\/\\\:]/g, "-");

    downloadExcel({
      fileName: `Applicants_List_${timestamp}`,
      sheet: "Applicants",
      tablePayload: {
        header: headers,
        body: downloadData,
      },
    });
  };

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>List of Applicants</h4>
        </MDBCardText>
      </MDBCardBody>

      <Paper className="p-3 w-100 my-2">
        {/* Search and Filter Section */}
        <Box sx={{ mb: 3 }}>
          <h5 style={{ marginBottom: "16px" }}>Search and Filter</h5>

          {/* Search Bar */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search by name, email, application ID, or phone number..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <i
                    className="fas fa-magnifying-glass"
                    style={{ marginRight: "8px", color: "#999" }}
                  ></i>
                ),
              }}
            />
          </Box>

          {/* Filter Row */}
          <MDBRow>
            <MDBCol md="3" sm="6" xs="12" className="mb-2">
              <FormControl fullWidth size="small">
                <InputLabel>Session</InputLabel>
                <Select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  label="Session"
                >
                  <MenuItem value="">All Sessions</MenuItem>
                  {uniqueSessions.map((session) => (
                    <MenuItem key={session} value={session}>
                      {session}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBCol>

            <MDBCol md="3" sm="6" xs="12" className="mb-2">
              <FormControl fullWidth size="small">
                <InputLabel>State</InputLabel>
                <Select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  label="State"
                >
                  <MenuItem value="">All States</MenuItem>
                  {uniqueStates.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBCol>

            <MDBCol md="3" sm="6" xs="12" className="mb-2">
              <FormControl fullWidth size="small">
                <InputLabel>LGA</InputLabel>
                <Select
                  value={filterLGA}
                  onChange={(e) => setFilterLGA(e.target.value)}
                  label="LGA"
                >
                  <MenuItem value="">All LGAs</MenuItem>
                  {uniqueLGAs.map((lga) => (
                    <MenuItem key={lga} value={lga}>
                      {lga}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBCol>

            <MDBCol md="3" sm="6" xs="12" className="mb-2">
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select
                  value={filterProgramme}
                  onChange={(e) => setFilterProgramme(e.target.value)}
                  label="Programme"
                >
                  <MenuItem value="">All Programmes</MenuItem>
                  {uniqueProgrammes.map((programme) => (
                    <MenuItem key={programme} value={programme}>
                      {programme}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBCol>
          </MDBRow>

          {/* Filter Actions */}
          <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleClearFilters}
              size="small"
            >
              Clear Filters
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "#05321e" }}
              onClick={handleDownloadFiltered}
              size="small"
              disabled={filteredApplicants.length === 0}
            >
              <i className="fas fa-download" style={{ marginRight: "8px" }}></i>
              Download Filtered Results
            </Button>
            <span style={{ fontSize: "14px", color: "#666" }}>
              Results: {filteredApplicants.length} applicant(s) found
            </span>
          </Box>
        </Box>

        {/* Applicants Table */}
        <MDBRow>
          <MDBCol>
            <TableContainer sx={{ maxHeight: 600, width: "100%" }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#05321e",
                          color: "white",
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPageData.length > 0 ? (
                    currentPageData.map((row, id) => (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={`${row.ApplicationId}-${id}`}
                      >
                        <TableCell>{page * rowsPerPage + id + 1}</TableCell>
                        <TableCell>{row.ApplicationId || "-"}</TableCell>
                        <TableCell>
                          {(row.FirstName || "") + " " + (row.Surname || "")}
                        </TableCell>
                        <TableCell>{row.PhoneNumber || "-"}</TableCell>
                        <TableCell>{row.Email || "-"}</TableCell>
                        <TableCell>{row.State || "-"}</TableCell>
                        <TableCell>{row.LGA || "-"}</TableCell>
                        <TableCell>{row.FirstChoiceProgramme || "-"}</TableCell>
                        <TableCell>{row.SessionOfEntry || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                        No applicants found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={filteredApplicants.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
}
