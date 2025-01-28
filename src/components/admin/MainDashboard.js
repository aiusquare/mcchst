import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { MDBCard, MDBCol, MDBContainer, MDBRow } from "mdb-react-ui-kit";
import * as React from "react";
import { useState } from "react";
import CarouselComp from "./careusal";
import request from "superagent";
import { PieChart } from "@mui/x-charts";
import { useEffect } from "react";
import ReactResearchBox from "react-search-box";

const MainDashboard = () => {
  const [init, setInit] = useState(false);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalVarified, setTotalVerified] = useState(0);
  const [totalApplied, setTotalApplied] = useState(0);
  const [applicants, setApplicants] = useState([]);

  const columns = [
    { id: "sn", label: "SN", minWidth: 20 },
    { id: "ApplicantName", label: "Applicant Name", minWidth: 100 },
    { id: "ApplicantNumber", label: "Applicant Number", minWidth: 70 },
    { id: "ApplicantEmail", label: "Applicant Email", minWidth: 50 },
    { id: "FirstChoiceProgram", label: "First Choice Programme", minWidth: 50 },
    {
      id: "SecondChoiceProgram",
      label: "Second Choice Programme",
      minWidth: 50,
    },
  ];

  const [tempData, setTempData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filteredResult = tempData.filter((item) => {
      const fullName = `${item.FirstName || ""} ${item.Surname || ""}`;
      const email = item.Email || "";
      const phoneNumber = item.PhoneNumber || "";
      const firstChoice = item.FirstChoice || "";
      const secondChoice = item.SecondChoice || "";

      return (
        fullName.includes(searchTerm) ||
        phoneNumber.includes(searchTerm) ||
        firstChoice.includes(searchTerm) ||
        secondChoice.includes(searchTerm) ||
        email.includes(searchTerm)
      );
    });

    // Update state with filtered data
    setApplicants(filteredResult);
  }, [searchTerm]);

  useEffect(() => {
    handleDataFetch();
  }, []);

  const handleDataFetch = async () => {
    try {
      const response = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/get_pre_application_applicants.php"
      );

      const applicantsList = response.body;

      const applResponse = await request.get(
        "https://api.mcchstfuntua.edu.ng/admin/get_applicants.php"
      );

      const regApplicantsList = applResponse.body.application;
      const regApplicantsCourses = applResponse.body.course_details;
      let newArray = [];

      regApplicantsList.map((e, i) => {
        const rec = {
          FirstName: e.FirstName,
          Surname: e.Surname,
          Email: e.Email,
          PhoneNumber: e.PhoneNumber,
          FirstChoice: regApplicantsCourses[i].FirstChoiceProgramme,
          SecondChoice: regApplicantsCourses[i].SecondChoiceProgramme,
        };

        newArray.push(rec); // Fixed this line
      });

      setApplicants(newArray); // Set the state with the new array
      setTempData(newArray);

      let p = 0;
      let v = 0;
      let a = 0;
      applicantsList.forEach((row) => {
        if (row.Paid && row.Paid === "yes") {
          p += 1;
        }

        if (row.eVarified === "yes") {
          v += 1;
        }

        if (row.IsRegistered === "yes") {
          a += 1;
        }
      });

      let ta = p + v + a;

      p = (p / ta) * 100;
      v = (v / ta) * 100;
      a = (a / ta) * 100;

      setTotalPaid(60);
      setTotalVerified(10);
      setTotalApplied(30);
      setTotalApplicants(ta);

      setInit(true);
    } catch (err) {
      console.error("Error message:", err.response);
      console.error("ERROR", err);
    }
  };

  return (
    <MDBContainer>
      <MDBRow>
        <MDBCol md={6}>
          <Paper className="h-100 p-4">
            <PieChart
              series={[
                {
                  data: [
                    {
                      id: 1,
                      value: totalVarified,
                      label: "varified",
                    },
                    {
                      id: 2,
                      value: totalPaid,
                      label: "paid",
                    },
                    {
                      id: 3,
                      value: totalApplied,
                      label: "applied",
                    },
                  ],
                },
              ]}
              className="m-2"
              width={400}
              height={200}
            />
          </Paper>
        </MDBCol>
        <MDBCol md={6}>
          <Paper className="">
            <div>
              <MDBCard style={{ height: "330px" }}>
                <CarouselComp />
              </MDBCard>
            </div>
          </Paper>
        </MDBCol>
      </MDBRow>

      <MDBRow>
        <MDBCol>
          <Paper className="mt-4" sx={{ width: "100%", overflow: "hidden" }}>
            <div style={{ fontWeight: "900", padding: "20px" }}>
              APPLIED APPLICANTS
            </div>

            <div>
              <ReactResearchBox
                placeholder="search for record"
                onChange={(e) => {
                  setSearchTerm(e);
                }}
              />
            </div>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => {
                      return (
                        <TableCell
                          key={column.id}
                          style={{ minWidth: column.minWidth }}
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
                        {<TableCell key={id + 2}>{id + 1}</TableCell>}
                        {
                          <TableCell key={id + 2}>
                            {row.FirstName + " " + row.Surname}
                          </TableCell>
                        }
                        {<TableCell key={id + 3}>{row.PhoneNumber}</TableCell>}
                        {<TableCell key={id + 4}>{row.Email}</TableCell>}
                        {<TableCell key={id + 5}>{row.FirstChoice}</TableCell>}
                        {<TableCell key={id + 6}>{row.SecondChoice}</TableCell>}
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
          </Paper>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default MainDashboard;
