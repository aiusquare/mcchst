import { useState } from "react";
import { loader } from "../components/LoadingSpinner";
import { Toast } from "../components/errorNotifier";
import { useEffect } from "react";
import axios from "axios";

export default function usePost(url, reqData, loadingTitle, loadingText) {
  const [data, setData] = useState(null);

  if (!url) return;

  if (loadingTitle !== null)
    loader({
      title: loadingTitle,
      text: loadingText,
    });

  const fetchData = async () => {
    try {
      const response = await axios.post(url, reqData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Assuming the API returns the data in response.data
      const data = response.data.data;

      if (data) {
        setData(data);
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
  };

  fetchData();

  return { data };
}
