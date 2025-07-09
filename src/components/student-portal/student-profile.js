import { React, useEffect, useState } from "react";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBBtn,
  MDBBreadcrumb,
  MDBBreadcrumbItem,
  MDBIcon,
} from "mdb-react-ui-kit";

import "./css/style.css";
import request from "superagent";
import PassportUploader from "./picture-uploder";
import { Toast } from "../errorNotifier";
import { loader } from "../LoadingSpinner";
import Countdown from "../count-down/countdown";

export default function StudentProfile(props) {
  const userData = props.userData;
  const [init, setInit] = useState(false);
  const [basicDetails, setBasicDetails] = useState([]);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isPictureUploaded, setIsPictureUploaded] = useState(true);

  const uploadImageToServer = async () => {
    if (!image) {
      alert("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("application_id", userData.ApplicationId);
    formData.append("email", userData.Email);
    formData.append("phone", userData.PhoneNumber);
    formData.append("name", userData.FirstName);

    try {
      loader({
        title: "Uploading your passport",
        text: "Please! wait while we upload your passport.",
      });

      const response = await fetch(
        "https://api.mcchstfuntua.edu.ng/uploads/passport.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setIsPictureUploaded(true);
        Toast.fire({
          icon: "success",
          title: "Image uploaded successfully!",
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "Upload failed: " + result.message,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);

      Toast.fire({
        icon: "error",
        title: "An error occurred during upload.",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = {
          email: userData.Email,
        };

        const response = await request
          .post("https://api.mcchstfuntua.edu.ng/dashboard/get_data.php")
          .type("application/json")
          .send(data);

        if (response.body) {
          const basicDetails = response.body;

          if (basicDetails.PassportName) {
            setIsPictureUploaded(true);
            setImageUrl(
              "https://api.mcchstfuntua.edu.ng/uploads/passports/" +
                basicDetails.PassportName
            );
          } else {
            setIsPictureUploaded(false);
          }

          setBasicDetails(basicDetails);
          setInit(true);
        } else {
          console.log("Unexpected response:", response);
        }
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response ? err.response : err
        );
      }
    };

    if (userData && userData.Email) {
      fetchData();
    }
  }, [userData, init]);

  return (
    <div>
      <div
        className="bg-image p-2"
        style={{ backgroundColor: "#05321e", color: "white" }}
      >
        <h3>You are expected to complete onboarding before the countdown</h3>
      </div>
      <div className="mb-4">
        <Countdown
          targetDate={new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)}
          handleExpire={(expired) => console.log("Expired:", expired)}
        />
      </div>
      <MDBContainer className="py-5">
        <MDBRow>
          <MDBCol>
            <MDBBreadcrumb className="bg-light rounded-3 p-3 mb-4">
              <MDBBreadcrumbItem>Home</MDBBreadcrumbItem>
              <MDBBreadcrumbItem>User</MDBBreadcrumbItem>
              <MDBBreadcrumbItem active>User Profile</MDBBreadcrumbItem>
            </MDBBreadcrumb>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBCol lg="4">
            <MDBCard className="shadow-1 mb-4">
              <MDBCardBody className="text-center d-flex flex-column align-items-center">
                <PassportUploader
                  onUpload={setImage}
                  imageUrl={imageUrl}
                  isPictureUploaded={isPictureUploaded}
                />
                <div className="d-flex justify-content-center">
                  <MDBBtn
                    style={{ background: "#05321e" }}
                    className="p-1 px-4 w-100 button"
                    size="sm"
                    onClick={uploadImageToServer}
                    disabled={isPictureUploaded}
                  >
                    <MDBIcon
                      size="sm"
                      className="me-2"
                      fas
                      icon="pen-to-square"
                    />
                    save picture
                  </MDBBtn>
                </div>

                {/* Other Details Below */}
                <div className="mt-1 w-100">
                  <p className="text-muted mb-1">
                    <div
                      className="m-2 p-2 w-100"
                      style={{ background: "#daab2a", color: "white" }}
                    >
                      <strong>
                        {basicDetails.MatricNumber
                          ? basicDetails.MatricNumber
                          : userData.ApplicationId}
                      </strong>
                    </div>
                  </p>
                  <p className="text-muted">{basicDetails.Programme}</p>
                  <p className="text-muted">
                    <i>Department of </i>
                    <b>{" " + basicDetails.Department}</b>
                  </p>

                  {/* Button Section */}
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol lg="8">
            <MDBCard className="shadow-1 mb-4 p-1">
              <h4>Basic Info</h4>
              <MDBCardBody>
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Fullname</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">
                      <b>
                        {userData.FirstName +
                          " " +
                          userData.Surname +
                          " " +
                          userData.OtherName}
                      </b>
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Email</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">
                      <b>{userData.Email}</b>
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Phone</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">
                      <b>+234 {userData.PhoneNumber}</b>
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Mobile</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">
                      <b>+234 {userData.PhoneNumber}</b>
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Address</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">
                      <b></b>
                    </MDBCardText>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}
