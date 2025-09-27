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
import { baseUrl } from "../../../services/setup";

const CreateUser = (props) => {
  const navigate = useNavigate();
  const mapUserDataToForm = (userData) => {
    return {
      fullname: userData.fullname ?? "",
      userId: userData.user_id ?? "",
      phoneNumber: userData.phone_number ?? "",
      access: userData.access ?? "",
      accessMode: userData.mode ?? "",
      userStatus: userData.status ?? "",
      department: userData.department ?? "",
      office: userData.office_role ?? "",
      hasAdminAccess: !!userData.access, // true if user has access
      isOfficer: userData.access === "officer", // guess based on role
    };
  };

  const {
    formData,
    handleInputChange,
    handleAccessChange,
    handleAdminAccessToggle,
    handleOfficerToggle,
  } = useUserForm(
    props.mode === "edit" ? mapUserDataToForm(props.userData) : {}
  );
  console.log("props", props);

  const handleUserCreation = async () => {
    if (!validateUserForm(formData)) return;

    if (!navigator.onLine) {
      Toast.fire({ icon: "error", title: "No internet connection" });
      return;
    }

    try {
      loader({ title: "Creating User", text: "please wait..." });

      if (props.mode !== "edit") {
        await request
          .post(baseUrl + "admin/create_user")
          .type("application/json")
          .send(formData);
      } else {
        await request
          .post(baseUrl + "admin/edit_user")
          .type("application/json")
          .send(formData);
      }

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
                value={formData.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                required
              />

              <TextField
                label="Staff ID"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={formData.userId}
                onChange={(e) => handleInputChange("userId", e.target.value)}
                required
                disabled={props.mode !== "edit" ? false : true}
              />

              <TextField
                label="Phone Number"
                className="center-cmp w-100"
                variant="outlined"
                margin="normal"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                required
              />

              {/* Status and Department */}
              <SelectionBox
                label="Status"
                className="center-cmp"
                value={formData.userStatus}
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
                value={formData.department}
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
                    value={formData.access}
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
                {props.mode === "edit" ? "UPDATE USER" : "CREATE USER"}
              </MDBBtn>
            </MDBCol>
          </MDBRow>
        </MDBCard>
      </MDBContainer>
    </div>
  );
};

export default CreateUser;
