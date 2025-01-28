import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import ReactSearchBox from "react-search-box";
import { MDBCard, MDBCardBody, MDBCardText } from "mdb-react-ui-kit";
import { Tab, Tabs } from "@mui/material";
import { useContext } from "react";
import { ServiceComContext } from "./dashboard";
import { useEffect } from "react";
import { useState } from "react";
import request, { agent } from "superagent";

const columns = [
  { id: "customerName", label: "Customer Name", minWidth: 100 },
  { id: "customerNumber", label: "Customer Number", minWidth: 50 },
];
const services = ["All Transactions", "SHOP A", "SHOP B", "SHOP C"];

export default function CustomersComponent() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [tabIndex, setTabIndex] = React.useState(0);
  const [service, setService] = React.useState("Data");
  const [rows, setRows] = useState([]);
  const [init, setInit] = useState(false);
  const { uniqueId } = useContext(ServiceComContext);
  const userId = uniqueId;

  useEffect(() => {
    if (!init) {
      handleDataFetch();
    }
  }, [init, userId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleDataFetch = async () => {
    await request
      .get("https://api.foudhan.com/nakowa/customers.php")
      .then((response) => {
        const theData = response.body;
        setRows(theData);
        setInit(true);
      })
      .catch((err) => {
        console.log("Error message:", err.response);
        console.log("ERROR", err);
      });
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleChange = (e, i) => {
    setTabIndex(i);
    // setAccount(accounts[i]);
  };

  return (
    <div
      className="m-4 d-flex flex-column align-items-center"
      // ref={refBuyAirtime}
    >
      <MDBCardBody>
        <MDBCardText>
          <h3>CUSTOMERS</h3>
        </MDBCardText>
      </MDBCardBody>
      <MDBCard className="shadow-2 m-2 w-100">
        <Tabs
          textColor="white"
          variant="fullWidth"
          value={tabIndex}
          onChange={handleChange}
          scrollButtons="auto"
        >
          {services.map((e, i) => {
            return (
              <Tab
                key={i}
                className="tab-t-size "
                // style={{ whiteSpace: "nowrap" }}
                label={e}
              />
            );
          })}
        </Tabs>
        <div className="w-50 m-2">
          <ReactSearchBox
            placeholder="Search for record by refrance number"
            data={rows}
            leftIcon={
              <>
                <i class="fas fa-magnifying-glass"></i>
              </>
            }
            iconBoxSize="48px"
            autoFocus
          />
        </div>
      </MDBCard>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {service === "Data" &&
                  columns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, id) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={id}>
                    {<TableCell key={id + 1}>{row.name}</TableCell>}
                    {<TableCell key={id + 2}>{row.phoneNumber}</TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
