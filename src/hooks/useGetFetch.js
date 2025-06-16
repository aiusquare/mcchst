import { useState } from "react";

export default function useGetFetch(url, loadingTitle, loadingText) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!url) return;

    loader({
      title: loadingTitle,
      text: loadingText,
    });

    try {
      const response = axios.get(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Assuming the API returns the data in response.data
      const data = response.data.data;

      if (data) {
        setData(data);
      } else {
        setError("an error occoured");
        Toast.fire({
          icon: "error",
          title: errorMessage,
        });
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to search for user";
      setError(errorMessage);
    } finally {
      setLoading(false);
      Toast.fire({
        icon: "error",
        title: errorMessage,
      });
    }
  }, [url]);

  return { data };
}
