// utils/postData.js or wherever appropriate
import axios from "axios";
import { loader } from "../components/LoadingSpinner";
import { Toast } from "../components/errorNotifier";

export async function postData(
  url,
  reqData,
  loadingTitle = null,
  loadingText = null
) {
  if (!url) return;
  if (!reqData) {
    console.error("Request data is required");
    return;
  }

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
    });

    const data = response.data.data;

    if (data) {
      return data;
    } else {
      Toast.fire({
        icon: "error",
        title: response.data.error,
      });
    }
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
