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
} from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import request from "superagent";
import ReactSearchBox from "react-search-box";

export default function ListOfApplicantsPage() {
  const [rows, setRows] = useState([]);
  const [init, setInit] = useState(false);

  const [applicants, setApplicants] = useState([]);

  const columns = [
    { id: "sn", label: "SN" },
    { id: "refrance", label: "Applicant ID" },
    { id: "ApplicantName", label: "Applicant name" },
    { id: "ApplicantNumber", label: "Phone number" },
    { id: "totalDiscount", label: "Applicant email" },
    { id: "State", label: "State" },
    { id: "LGA", label: "LGA" },
    { id: "FirstChoice", label: "First choice" },
  ];

  useEffect(() => {
    // if (!init) {
    handleDataFetch();
    // }
  }, []);

  const handleDataFetch = async () => {
    try {
      const basicResponse = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/application/list/index.php"
      );
      const basicDetails = basicResponse.body;

      console.log("THE LIST OF APPLICANTS: ", basicDetails);
      setApplicants(basicDetails);

      setInit(true);
    } catch (err) {
      console.error("Error fetching data: ", err);
    }
  };

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>List of Applicants</h4>
        </MDBCardText>
      </MDBCardBody>

      <Paper className="p-2 w-100 my-2">
        <MDBRow>
          <MDBCol>
            <div>
              <ReactSearchBox
                leftIcon={
                  <div>
                    <i class="fas fa-magnifying-glass"></i>
                  </div>
                }
                placeholder="search for record"
                value="Doe"
              />
            </div>
            <TableContainer sx={{ maxHeight: 440, width: "100%" }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => {
                      return (
                        <TableCell
                          key={column.id}
                          // style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applicants.map((row, id) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={id}>
                        {<TableCell key={id + 1}>{id + 1}</TableCell>}
                        {
                          <TableCell key={id + 1}>
                            {row.ApplicationId}
                          </TableCell>
                        }
                        {
                          <TableCell key={id + 2}>
                            {row.FirstName + " " + row.Surname}
                          </TableCell>
                        }
                        {<TableCell key={id + 3}>{row.PhoneNumber}</TableCell>}
                        {<TableCell key={id + 4}>{row.Email}</TableCell>}
                        {<TableCell key={id + 5}>{row.State}</TableCell>}
                        {<TableCell key={id + 6}>{row.LGA}</TableCell>}
                        {
                          <TableCell key={id + 7}>
                            {row.FirstChoiceProgramme}
                          </TableCell>
                        }
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={applicants.length}
              rowsPerPage={10}
              page={10}
              // onPageChange={handleChangePage}
              // onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </MDBCol>
        </MDBRow>
      </Paper>

      {/* <MDBRow>
        <MDBCol>
          <Paper className="mt-4 p-4" sx={{ overflow: "hidden" }}>
            <div style={{ fontWeight: "900", padding: "20px" }}>
              LIST OF APPLICANT
            </div>
            
          </Paper>
        </MDBCol>
      </MDBRow> */}
    </div>
  );
}
