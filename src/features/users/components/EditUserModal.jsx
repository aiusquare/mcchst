import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Toast } from "../../../components/errorNotifier";
import { baseUrl } from "../../../services/setup";
import request from "superagent";

const EditUserModal = ({ show, onHide, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    user_id: "",
    status: "",
    access: "",
    mode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        user_id: user.user_id || "",
        status: user.status || "",
        access: user.access || "",
        mode: user.mode || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await request
        .post(baseUrl + "admin/update_user.php")
        .send(formData);

      if (response.body.status === "success") {
        Toast.fire({
          icon: "success",
          title: "User updated successfully",
        });
        onUpdate(formData); // Update local state
        onHide(); // Close modal
      } else {
        throw new Error(response.body.message || "Failed to update user");
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err.message || "An error occurred while updating the user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">User ID</label>
            <input
              type="text"
              className="form-control"
              name="user_id"
              value={formData.user_id}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Access Level</label>
            <select
              className="form-select"
              name="access"
              value={formData.access}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Access Level</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Mode</label>
            <select
              className="form-select"
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Mode</option>
              <option value="full">Full Access</option>
              <option value="limited">Limited Access</option>
              <option value="readonly">Read Only</option>
            </select>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onHide}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditUserModal;
