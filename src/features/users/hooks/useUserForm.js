import { useState } from "react";
import { Toast } from "../../../components/errorNotifier";

export const useUserForm = (initialValues = {}) => {
  const [formData, setFormData] = useState({
    fullname: "",
    userId: "",
    email: "",
    phoneNumber: "",
    access: "",
    accessMode: "readOnly",
    userStatus: "",
    hasAdminAccess: false,
    isOfficer: false,
    office: "",
    department: "",
    ...initialValues,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAccessChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      access: value,
      accessMode:
        value === "siteAdmin" || value === "fullAccess"
          ? "readWrite"
          : "readOnly",
      isOfficer: value === "officer",
      office: value === "officer" ? prev.office : "",
    }));
  };

  const handleAdminAccessToggle = () => {
    setFormData((prev) => ({
      ...prev,
      hasAdminAccess: !prev.hasAdminAccess,
      access: !prev.hasAdminAccess ? prev.access : "",
      accessMode: !prev.hasAdminAccess ? prev.accessMode : "",
      isOfficer: false,
      office: "",
    }));
  };

  const handleOfficerToggle = () => {
    setFormData((prev) => ({
      ...prev,
      isOfficer: !prev.isOfficer,
      office: !prev.isOfficer ? prev.office : "",
    }));
  };

  return {
    formData,
    handleInputChange,
    handleAccessChange,
    handleAdminAccessToggle,
    handleOfficerToggle,
  };
};
