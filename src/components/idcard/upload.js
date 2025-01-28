import React, { useState } from "react";
import Resizer from "react-image-file-resizer";
import { MDBBtn, MDBCol, MDBInput, MDBRow } from "mdb-react-ui-kit";
import { Paper, TextField } from "@mui/material";
import { MuiFileInput } from "mui-file-input";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { Toast } from "../errorNotifier";
import request from "superagent";
import { loader } from "../LoadingSpinner";
import logo from "../../pictures/logo.png";
import { useNavigate } from "react-router-dom";
import "./style.css";

const IdImageUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [resizedImage, setResizedImage] = useState(null);

  const handleFileChange = (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        title: "Error!",
        text: "Only JPEG and PNG formats are allowed.",
        icon: "error",
      });
      return;
    }

    setFile(file);

    Resizer.imageFileResizer(
      file,
      300, // max width
      300, // max height
      file.type === "image/jpeg" ? "JPEG" : "PNG", // format based on file type
      100, // quality
      0, // rotation
      (uri) => {
        setResizedImage(uri);
      },
      "blob" // output type
    );
  };

  const handleSubmit = async () => {
    if (!file || !resizedImage) {
      Swal.fire({
        title: "Error!",
        text: "No file selected or invalid file",
        icon: "error",
      });
      return;
    }

    loader({
      title: "Uploading",
      text: "Please wait...",
    });

    const formData = new FormData();
    formData.append("file", resizedImage, file.name);

    try {
      const res = await request
        .post("https://api.mcchstfuntua.edu.ng/upload.php")
        .send(formData)
        .set("Accept", "application/json");

      Toast.fire({
        icon: "success",
        title: "Uploaded successfully",
      });
    } catch (err) {
      console.error("Error uploading file", err);
      Swal.fire({
        title: "Error!",
        text: "There was an error uploading the file.",
        icon: "error",
      });
    }
  };

  return (
    <div>
      <Paper sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
        <img
          className="logo"
          alt="logo"
          src={logo}
          onClick={() => {
            navigate("/");
          }}
        />
        <div style={{ fontWeight: "900", padding: "20px" }}>
          Image upload manager
        </div>

        <MDBRow style={{ padding: "10px" }}>
          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            {/* <MDBInput
              className="w-50"
              label="Email"
              placeholder="Enter your email here..."
            /> */}

            <TextField
              label="Your Email"
              //   value={otherName}
              className="center-cmp c-width"
              variant="outlined"
              onChange={() => {}}
            />
          </MDBCol>
        </MDBRow>
        <MDBRow style={{ padding: "10px" }}>
          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            <div>
              <MuiFileInput
                InputProps={{
                  inputProps: {
                    accept: ".jpeg, .png",
                  },
                  startAdornment: <AttachFileIcon />,
                }}
                className="c-width"
                value={file}
                placeholder="Upload your picture here..."
                onChange={handleFileChange}
                clearIconButtonProps={{
                  title: "Remove",
                  children: <CloseIcon fontSize="small" />,
                }}
              />
            </div>
          </MDBCol>
        </MDBRow>

        <MDBRow style={{ padding: "10px" }}>
          <MDBCol style={{ display: "flex", justifyContent: "center" }}>
            <MDBBtn
              onClick={handleSubmit}
              style={{ background: "#05321e" }}
              className="p-3 w-50"
            >
              Upload
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </Paper>
    </div>
  );
};

export default IdImageUpload;
