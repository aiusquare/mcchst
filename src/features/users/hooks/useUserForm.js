import { useEffect, useState } from "react";

export const useUserForm = (initialValues = {}) => {
  const [formData, setFormData] = useState({
    fullname: "",
    userId: "",
    phoneNumber: "",
    access: "",
    accessMode: "readOnly",
    userStatus: "",
    hasAdminAccess: false,
    isOfficer: false,
    office: "",
    department: "",
    additionalPages: [],
    ...initialValues,
  });

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, []); // ✅ Only run once, on first mount

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdditionalPageToggle = (path) => {
    setFormData((prev) => {
      const currentPages = prev.additionalPages || [];
      const additionalPages = currentPages.includes(path)
        ? currentPages.filter((page) => page !== path)
        : [...currentPages, path];

      return {
        ...prev,
        additionalPages,
      };
    });
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
      additionalPages: !prev.hasAdminAccess ? prev.additionalPages : [],
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
    handleAdditionalPageToggle,
  };
};
