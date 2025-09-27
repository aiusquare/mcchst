import * as React from "react";
import Paper from "@mui/material/Paper";
import "../../admin/css/style.css";
import {
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBIcon,
  MDBRow,
} from "mdb-react-ui-kit";
import { useEffect, useState } from "react";
import request from "superagent";
import { Toast } from "../../errorNotifier";
import { loader } from "../../LoadingSpinner";
import { useNavigate } from "react-router-dom";

export default function AdmittedStdTab() {
  const navigate = useNavigate();
  const [listOfAdmittedStudents, setListOfAdmittedStudents] = useState([]);

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleFetchData = async () => {
    if (listOfAdmittedStudents.length > 0) return; // Prevents unnecessary fetches

    try {
      await request
        .get("https://api.mcchstfuntua.edu.ng/admin/get_admitted.php")
        .type("application/json")
        .then((response) => {
          // console.log("FETCH RES: ", response);
          setListOfAdmittedStudents(response.body.list);
        });
    } catch (err) {      // console.log(err);
    }
  };

  // Function to handle the icon click
  const handleStudentProfileLink = (email) => {
    navigate("/student-profile", {
      state: { userEmail: email },
    });
  };

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>Admitted students</h4>
        </MDBCardText>
      </MDBCardBody>

      <Paper className="mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            <table>
              <tr style={{ textAlign: "left" }}>
                <th>SN</th>
                <th>App No.</th>
                <th>Fullname</th>
                <th>Programme</th>
                <th>Phone number</th>
                <th>Email</th>
                <th>View</th>
              </tr>
              {listOfAdmittedStudents.map((std, i) => {
                return (
                  <tr>
                    <td>{i + 1}</td>
                    <td>{std.ApplicationNo}</td>
                    <td>{std.Fullname}</td>
                    <td>{std.Programme}</td>
                    <td>{std.PhoneNumber}</td>
                    <td>{std.Email}</td>
                    <td>
                      <MDBIcon
                        size="lg"
                        fas
                        icon="share"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => handleStudentProfileLink(std.Email)}
                      />
                    </td>
                  </tr>
                );
              })}
            </table>
          </MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
}
