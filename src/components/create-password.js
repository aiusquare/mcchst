import React, { useState } from "react";
import request from "superagent";
import { loader } from "./LoadingSpinner";
import { Toast } from "./errorNotifier";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AdminPasswordCreationForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password === "") {
      setError("Password cannot be empty");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    if (navigator.onLine) {
      loader({ title: "Creating password", text: "please wait..." });

      const data = {
        password: password,
        userId: localStorage.getItem("userId"),
      };

      await request
        .post("https://api.mcchstfuntua.edu.ng/admin/create_user_password.php")
        .type("application/json")
        .send(data)
        .then((response) => {
          Toast.fire({
            icon: "success",
            title: "Successfully created",
          });

          navigate("/admin-login");
        })
        .catch((err) => {
          let errorMsg = "";

          if (err.response && err.response.status === 400) {
            // console.log("ERROR HERE", err.response.text);
            errorMsg = err.response.text;
          } else {
            // console.error("Network error:", err);
            errorMsg = err;
          }

          Swal.fire({
            title: "Error",
            text: errorMsg,
            icon: "error",
          });
        });
    } else {
      Toast.fire({
        icon: "error",
        title: "No internet connection",
      });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3>Create a Password</h3>
      <form onSubmit={handleSubmit}>
        {/* Password field */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-group">
            <input
              placeholder="Enter your password here..."
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Confirm password field */}
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <div className="input-group">
            <input
              placeholder="Re-enter your password here..."
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Error message */}
        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary w-50 mb-3">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AdminPasswordCreationForm;
