import * as React from "react";
import Paper from "@mui/material/Paper";
import {
  MDBBtn,
  MDBCardBody,
  MDBCardText,
  MDBCol,
  MDBIcon,
  MDBRow,
} from "mdb-react-ui-kit";
import { useEffect, useState } from "react";
import request from "superagent";
import Swal from "sweetalert2";
import { Toast } from "../../errorNotifier";
import { loader } from "../../LoadingSpinner";
import { MuiFileInput } from "mui-file-input";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useNavigate } from "react-router-dom";
import ReactResearchBox from "react-search-box";

export default function DepositoryPage() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [depos, setDepos] = useState([]);
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
    // set(filteredResult);
  }, [searchTerm]);

  const handleFileChange = (e) => {
    setFile(e);
  };

  const handleSubmit = async (e) => {
    if (!file) {
      Swal.fire({
        title: "Error!",
        text: "No file selected",
        icon: "error",
      });
      return;
    }

    loader({
      title: "Uploading",
      text: "Please wait...",
    });

    const formData = new FormData();
    formData.append("csv", file); // Ensure the name 'csv' matches your PHP script

    try {
      const res = await request
        .post("https://api.mcchstfuntua.edu.ng/depository/upload/")
        .send(formData)
        .set("Accept", "application/json");

      Toast.fire({
        icon: "success",
        title: "Uploaded successfully",
      });
      setFile(null);
    } catch (err) {
      console.error("Error uploading file", err);
      Swal.fire({
        title: "Error!",
        text: "There was an error uploading the file.",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleFetchData = async () => {
    if (depos.length > 0) return; // Prevents unnecessary fetches

    try {
      await request
        .get("https://api.mcchstfuntua.edu.ng/depository/")
        .type("application/json")
        .then((response) => {
          console.log("FETCH RES: ", response.body.depos);

          setDepos(response.body.depos);
        });
    } catch (err) {
      console.log(err);
    }
  };

  // Function to handle the icon click
  const handleDepoLink = (depo) => {
    navigate("/depo-preview", {
      state: { depo: depo },
    });
  };

  return (
    <div className="m-4 d-flex flex-column align-items-center">
      <MDBCardBody>
        <MDBCardText>
          <h4>Depository Management</h4>
        </MDBCardText>
      </MDBCardBody>

      <Paper className="mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <div style={{ fontWeight: "900", padding: "20px" }}>
            Extract Upload
          </div>
          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            <div>
              <MuiFileInput
                InputProps={{
                  inputProps: {
                    accept: ".csv",
                  },
                  startAdornment: <AttachFileIcon />,
                }}
                value={file}
                placeholder="choose the file here..."
                onChange={(e) => {
                  handleFileChange(e);
                }}
                clearIconButtonProps={{
                  title: "Remove",
                  children: <CloseIcon fontSize="small" />,
                }}
              />

              <MDBBtn
                onClick={handleSubmit}
                style={{ background: "#05321e", height: "56px" }}
                className="p-3"
              >
                Upload
              </MDBBtn>
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>

      <Paper className="mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <MDBCol>
            <div className="w-50 m-2">
              <ReactResearchBox
                placeholder="Search for record by refrance number"
                data={depos}
                leftIcon={
                  <>
                    <i class="fas fa-magnifying-glass"></i>
                  </>
                }
                iconBoxSize="48px"
                autoFocus
              />
            </div>
          </MDBCol>
        </MDBRow>
      </Paper>

      <Paper className="mt-2" sx={{ width: "100%", overflow: "hidden" }}>
        <MDBRow style={{ padding: "10px" }}>
          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            <table>
              <tr>
                <th>S/NO</th>
                <th>Type Of Meeting</th>
                <th>Date</th>
                <th>Subject</th>
                <th>Task</th>
                <th>Responsible Person</th>
                <th>Time Limit</th>
                <th>Completion Stage</th>
                <th>Remark</th>
                <th>Status</th>
                <th>View</th>
              </tr>
              {depos.map((depo, i) => {
                return (
                  <tr>
                    <td>{i + 1}</td>
                    <td>{depo.Date}</td>
                    <td>{depo.TypeOfMeeting}</td>
                    <td>{depo.Subject}</td>
                    <td>{depo.Task}</td>
                    <td>{depo.ResponsiblePerson}</td>
                    <td>{depo.TimeLimit}</td>
                    <td>{depo.CompletionStage}</td>
                    <td>{depo.Remark}</td>
                    <td>{depo.Status}</td>
                    <td>
                      <MDBIcon
                        size="lg"
                        fas
                        icon="share"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => handleDepoLink(depo)}
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
