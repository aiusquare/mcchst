import * as React from "react";
import Paper from "@mui/material/Paper";
// import ReactSearchBox from "react-search-box";
import { useNavigate } from "react-router-dom";
import CopyToClipboard from "react-copy-to-clipboard";
import editIcon from "../../pictures/edit.png";
import "../admin/css/style.css";
import {
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBRow,
  MDBBtn,
  MDBInputGroup,
  MDBIcon,
  MDBInput,
} from "mdb-react-ui-kit";
import {
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
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

export default function UsersTab() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [init, setInit] = useState(false);

  const [copied, setCopied] = useState(false);
  const refUrl = "https://mcchstfuntua.edu.ng/varify-email?ref=";

  useEffect(() => {
    if (!init) {
      handleDataFetch();
    }
  }, [rows]);

  const handleDataFetch = async () => {
    await request
      .get("https://api.mcchstfuntua.edu.ng/admin/get_users.php")
      .then((response) => {
        const basicDetails = response.body;

        setRows(basicDetails);

        setInit(true);
      })
      .catch((err) => {
        console.log("Error message:", err.response);
        console.log("ERROR", err);
      });
  };

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>Users Account</h4>
        </MDBCardText>
      </MDBCardBody>

      <Paper className="p-2 w-100 my-2">
        <MDBRow>
          <div
            style={{
              position: "relative",
              right: "20px",
              padding: "20px",
              width: "100%",
            }}
          >
            <MDBBtn
              onClick={() => {
                navigate("/admin/create-staff");
              }}
              style={{ background: "#05321e" }}
            >
              CREATE USER ACCOUNT
            </MDBBtn>
          </div>
        </MDBRow>
      </Paper>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <div style={{ fontWeight: "900", padding: "20px" }}>USERS</div>

          <MDBCol>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Previlages</th>
                    <th>Edit</th>
                    <th>Referrers</th>
                    <th>Referral Link</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((user, index) => {
                    return (
                      <tr key={index}>
                        <td>{user.fullname}</td>
                        <td>{user.user_id}</td>
                        <td>{user.status}</td>
                        <td>
                          {user.access}/{user.mode}
                        </td>

                        <td>
                          <img
                            src={editIcon}
                            style={{
                              width: "28px",
                              height: "28px",
                              cursor: "pointer",
                            }}
                          />
                        </td>
                        <td></td>
                        <td>
                          <Snackbar
                            style={{ position: "absolute" }}
                            open={copied}
                            anchorOrigin={{
                              horizontal: "center",
                              vertical: "top",
                            }}
                            autoHideDuration={6000}
                            onClose={() => {
                              setCopied(false);
                            }}
                          >
                            <Alert severity="success" sx={4}>
                              link copied
                            </Alert>
                          </Snackbar>

                          <MDBInputGroup
                            noWrap
                            textAfter={
                              <CopyToClipboard
                                text={refUrl + user.user_id}
                                onCopy={() => {
                                  setCopied(true);
                                }}
                              >
                                <MDBIcon
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="zindex-alert"
                                  style={{
                                    cursor: "pointer",
                                    color: "black",
                                  }}
                                  fas
                                  icon="paste"
                                />
                              </CopyToClipboard>
                            }
                          >
                            <MDBInput
                              type="text"
                              value={refUrl + user.user_id}
                              disabled
                              style={{
                                color: "black",
                                fontStyle: "bold",
                              }}
                            />
                          </MDBInputGroup>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
}
