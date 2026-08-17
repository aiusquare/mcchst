const configuredApiBaseUrl = process.env.REACT_APP_API_BASE_URL;

// In development, call the local React origin and let the CRA proxy forward
// API requests. This keeps the admin session cookie first-party on localhost.
// Production retains the established live API URL unless explicitly overridden.
export const baseUrl =
  configuredApiBaseUrl ||
  (process.env.NODE_ENV === "development"
    ? `${window.location.origin}/`
    : "https://app.mcchstfuntua.edu.ng/");
export const paystackPublicKey =
  "pk_live_93b81fa393853fd3d23c501294bff2f48e4cce93";
export const paystackTestKey =
  "pk_test_48324c9574d21008fc411518cd8b0321c4c4d3b4";

export const getPaystackPublicKey = () => {
  return paystackPublicKey;
};
