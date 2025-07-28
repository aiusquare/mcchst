import React from "react";
import {
  MDBBtn,
  MDBCard,
  MDBCol,
  MDBContainer,
  MDBRow,
} from "mdb-react-ui-kit";
import { FormControlLabel, Radio, RadioGroup, TextField } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import request from "superagent";

import TextInput from "../../../components/textField";
import SelectionBox from "../../../components/SelectionBox";
import { loader } from "../../../components/LoadingSpinner";
import { Toast } from "../../../components/errorNotifier";
import {
  accesses,
  admissionProgrammes,
  officers,
} from "../../../components/Arrays";
import { STAFF_STATUSES, ACCESS_MODES } from "../constants";
import { validateUserForm } from "../utils/validation";
import { useUserForm } from "../hooks/useUserForm";

const CreateUser = (props) => {
  const navigate = useNavigate();
  const {
    formData,
    handleInputChange,
    handleAccessChange,
    handleAdminAccessToggle,
    handleOfficerToggle,
  } = useUserForm();

  console.log("props", props);

  const handleUserCreation = async () => {
    if (!validateUserForm(formData)) return;

    if (!navigator.onLine) {
      Toast.fire({ icon: "error", title: "No internet connection" });
      return;
    }

    try {
      loader({ title: "Creating User", text: "please wait..." });

      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/create_user.php")
        .type("application/json")
        .send(formData);

      Toast.fire({
        icon: "success",
        title: "Successfully created",
      });

      navigate("/admin/users");
    } catch (err) {
      const errorMsg =
        err.response?.status === 400
          ? err.response.text
          : "An error occurred while creating the user";

      Toast.fire({
        icon: "error",
        title: errorMsg,
      });
    }
  };

  return (
    <div className="login-bg">
      <MDBContainer>
        <MDBCard className="shadow-0 d-flex flex-column align-items-center m-2">
          <div className="heading p-4">
            {props.mode === "edit" ? "EDIT USER" : "CREATE USER"}
          </div>

          <MDBRow className="m-2">
            <MDBCol>
              {/* Basic Information */}

              <TextField
                label="Full Name"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={props.userData?.fullname ?? formData.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                required
              />

              <TextField
                label="User ID"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={props.userData?.user_id ?? formData.userId}
                onChange={(e) => handleInputChange("userId", e.target.value)}
                required
              />

              <TextField
                label="Email"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={props.userData?.email ?? formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />

              {/* Status and Department */}
              <SelectionBox
                label="Status"
                className="center-cmp"
                value={props.userData?.status ?? formData.userStatus}
                changed={(value) => handleInputChange("userStatus", value)}
                content={STAFF_STATUSES.map((status) => (
                  <MenuItem key={status.code} value={status.name}>
                    {status.name}
                  </MenuItem>
                ))}
              />

              <SelectionBox
                label="Department"
                className="center-cmp"
                value={props.userData?.department ?? formData.department}
                changed={(value) => handleInputChange("department", value)}
                content={admissionProgrammes.map((dept) => (
                  <MenuItem key={dept.department} value={dept.department}>
                    {dept.department}
                  </MenuItem>
                ))}
              />

              {/* Administrative Access */}
              <FormControlLabel
                control={<input className="reg-radio" type="checkbox" />}
                label="Administrative access"
                checked={formData.hasAdminAccess}
                onChange={handleAdminAccessToggle}
              />

              {formData.hasAdminAccess && (
                <div className="admin-access-section">
                  <SelectionBox
                    label="User Access"
                    className="center-cmp"
                    value={props.userData?.access ?? formData.access}
                    changed={handleAccessChange}
                    content={accesses.map((access) => (
                      <MenuItem key={access.code} value={access.code}>
                        {access.name}
                      </MenuItem>
                    ))}
                  />

                  {/* Officer Access */}
                  <FormControlLabel
                    control={<input className="reg-radio" type="checkbox" />}
                    label="Officer access"
                    checked={formData.isOfficer}
                    onChange={handleOfficerToggle}
                  />

                  {formData.isOfficer && (
                    <SelectionBox
                      label="Office access"
                      className="center-cmp"
                      value={formData.office}
                      changed={(value) => handleInputChange("office", value)}
                      content={officers.map((office) => (
                        <MenuItem key={office.role} value={office.role}>
                          {office.name}
                        </MenuItem>
                      ))}
                    />
                  )}

                  {/* Access Mode */}
                  <RadioGroup
                    value={formData.accessMode}
                    onChange={(e) =>
                      handleInputChange("accessMode", e.target.value)
                    }
                    className="m-2"
                  >
                    <div className="mode-label">Mode</div>
                    <FormControlLabel
                      value={ACCESS_MODES.READ_ONLY}
                      control={<Radio />}
                      label="Read Only"
                    />
                    <FormControlLabel
                      value={ACCESS_MODES.READ_WRITE}
                      control={<Radio />}
                      label="Read and Write"
                    />
                  </RadioGroup>
                </div>
              )}
            </MDBCol>
          </MDBRow>

          <MDBRow className="m-2">
            <MDBCol>
              <MDBBtn
                className="mt-1 button"
                style={{ background: "#05321e" }}
                onClick={handleUserCreation}
              >
                CREATE USER
              </MDBBtn>
            </MDBCol>
          </MDBRow>
        </MDBCard>
      </MDBContainer>
    </div>
  );
};

export default CreateUser;
