import { VALIDATION_PATTERNS } from "../constants";
import { Toast } from "../../../components/errorNotifier";

export const validateUserForm = ({
  fullname,
  userId,
  phoneNumber,
  email,
  staffStatus,
  hasAdminAccess,
  access,
}) => {
  if (!fullname) {
    Toast.fire({ icon: "error", title: "Full name must be provided" });
    return false;
  }

  if (!userId) {
    Toast.fire({ icon: "error", title: "User ID must be provided" });
    return false;
  }

  if (!phoneNumber) {
    Toast.fire({ icon: "error", title: "Phone number must be provided" });
    return false;
  }

  if (!staffStatus) {
    Toast.fire({ icon: "error", title: "Please select status" });
    return false;
  }

  // Validate phone number
  const isValidPhone =
    VALIDATION_PATTERNS.PHONE.test(phoneNumber) &&
    !/[a-zA-Z]/.test(phoneNumber);
  if (!isValidPhone) {
    Toast.fire({
      icon: "error",
      title:
        "Invalid phone number. The valid format is +234XXXX or just 070XXXX",
    });
    return false;
  }

  // Validate email
  const isValidEmail = VALIDATION_PATTERNS.EMAIL.test(email);
  if (!isValidEmail) {
    Toast.fire({
      icon: "error",
      title: "Invalid email please check and try again.",
    });
    return false;
  }

  if (hasAdminAccess && !access) {
    Toast.fire({
      icon: "error",
      title: "Please select user access type",
    });
    return false;
  }

  return true;
};
