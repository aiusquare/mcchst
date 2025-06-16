import axios from "axios";
import { loader } from "../components/LoadingSpinner";
import { Toast } from "../components/errorNotifier";

export async function fetchFile(
  url,
  reqData,
  loadingTitle,
  loadingText,
  fileName
) {
  if (!url) return;

  if (loadingTitle !== null) {
    loader({
      title: loadingTitle,
      text: loadingText,
    });
  }

  try {
    const response = await axios.post(url, reqData, {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "blob", // ✅ Ensures correct binary download
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const fileUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", fileName); // You can use payCode for dynamic name
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(fileUrl);

    Toast.fire({
      icon: "success",
      title: "Successfully downloaded",
    });
  } catch (err) {
    console.error("Error:", err);
    const errorMessage =
      err.response?.error || err.message || "Failed to fetch data";

    Toast.fire({
      icon: "error",
      title: errorMessage,
    });
  }

  return null;
}
