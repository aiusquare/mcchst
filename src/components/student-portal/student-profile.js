import { React, useEffect, useState } from "react";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBBreadcrumb,
  MDBBreadcrumbItem,
  MDBIcon,
} from "mdb-react-ui-kit";

import "./css/style.css";
import request from "superagent";
import { useNavigate } from "react-router-dom";

export default function StudentProfile(props) {
  const navigate = useNavigate();
  const userData = props.userData;
  const [init, setInit] = useState(false);
  const [basicDetails, setBasicDetails] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = {
          email: userData.Email,
        };

        const response = await request
          .post("https://api.mcchstfuntua.edu.ng/admin/get_admitted_std.php")
          .type("application/json")
          .send(data);

        if (response.body) {
          const basicDetails = response.body;

          console.log("BASIC DETAIL", basicDetails);

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
    <section>
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
              <MDBCardBody className="text-center">
                <MDBCardImage
                  src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: "150px" }}
                  fluid
                />

                <p className="text-muted mb-1">
                  <strong>{userData.ApplicationId}</strong>
                </p>
                <p className="text-muted">{basicDetails.Programme}</p>
                <p className="text-muted">
                  <i>Department of </i> <b> {" " + basicDetails.Department}</b>
                </p>
                <div className="d-flex justify-content-center mb-2">
                  <MDBBtn
                    style={{ background: "#05321e" }}
                    className="m-2 p-2 w-100 button"
                    size="lg"
                    onClick={() => {
                      navigate("/validation");
                    }}
                  >
                    <MDBIcon
                      size="lg"
                      className="me-2"
                      fas
                      icon="pen-to-square"
                    />
                    Edit Profile
                  </MDBBtn>
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
                    <MDBCardText>Full Name</MDBCardText>
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
    </section>
  );
}
