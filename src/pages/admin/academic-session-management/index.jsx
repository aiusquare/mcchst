import React, { useState, useEffect } from "react";
import {
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBCard,
  MDBCardBody,
} from "mdb-react-ui-kit";
import axios from "axios";
import Swal from "sweetalert2";
import { Toast } from "../../../components/errorNotifier";
import { baseUrl } from "../../../services/setup";

const API_BASE_URL = baseUrl;

console.log("Academic Session Management - API_BASE_URL:", API_BASE_URL);

const AcademicSessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState({
    create: false,
    update: null, // sessionId being updated
    delete: null, // sessionId being deleted
    activate: null, // sessionId being activated
    deactivate: null, // sessionId being deactivated
    toggle: null, // sessionId being toggled
  });

  // Fetch all sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}session`);
      if (response.data.status) {
        setSessions(response.data.data || []);
        // Find active session
        const active = response.data.data.find((s) => s.status === "active");
        setActiveSession(active || null);
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load sessions",
      });
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (session = null) => {
    const isEditing = !!session;
    const initialName = session?.name || "";
    const initialStatus = session?.status || "inactive";
    const initialOpenedAt = session?.opened_at
      ? session.opened_at.split("T")[0]
      : "";
    const initialClosedAt = session?.closed_at
      ? session.closed_at.split("T")[0]
      : "";

    const { value, isConfirmed } = await Swal.fire({
      title: isEditing ? "Edit Session" : "Create New Session",
      html: `
        <div style="text-align: left;">
          <div class="mb-3">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              Session Name <span style="color: red;">*</span>
            </label>
            <input type="text" id="sessionName" class="swal2-input" placeholder="e.g., 2024/2025" value="${initialName}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <small style="display: block; color: #666; margin-top: 5px;">Format: YYYY/YYYY (e.g., 2024/2025)</small>
          </div>

          <div class="mb-3" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: bold;">Session Opens</label>
              <input type="date" id="openedAt" class="swal2-input" value="${initialOpenedAt}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: bold;">Session Closes</label>
              <input type="date" id="closedAt" class="swal2-input" value="${initialClosedAt}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
          </div>

          <div class="mb-3">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Status</label>
            <select id="status" class="swal2-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <option value="inactive" ${initialStatus === "inactive" ? "selected" : ""}>Inactive</option>
              <option value="active" ${initialStatus === "active" ? "selected" : ""}>Active</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isEditing ? "Update Session" : "Create Session",
      cancelButtonText: "Cancel",
      didOpen: () => {
        document.getElementById("sessionName").focus();
      },
      preConfirm: () => {
        const name = document.getElementById("sessionName").value.trim();
        if (!name) {
          Swal.showValidationMessage("Session name is required");
          return false;
        }
        return {
          name: name,
          status: document.getElementById("status").value,
          opened_at: document.getElementById("openedAt").value || null,
          closed_at: document.getElementById("closedAt").value || null,
        };
      },
    });

    if (isConfirmed && value) {
      if (isEditing) {
        await handleUpdateSession(session.id, value);
      } else {
        await handleCreateSession(value);
      }
    }
  };

  const handleCreateSession = async (formData) => {
    try {
      setOperationLoading((prev) => ({ ...prev, create: true }));
      console.log("Creating session:", formData);
      const response = await axios.post(
        `${API_BASE_URL}session/create`,
        formData,
      );
      console.log("Create response:", response.data);

      if (response.data.status) {
        Toast.fire({
          icon: "success",
          title: "Success",
          text: "Session created successfully",
        });
        fetchSessions();
      } else {
        Toast.fire({
          icon: "error",
          title: "Error",
          text: response.data.message || "Failed to create session",
        });
      }
    } catch (error) {
      console.error("Error creating session:", error);
      console.error("Response data:", error.response?.data);
      Toast.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to create session",
      });
    } finally {
      setOperationLoading((prev) => ({ ...prev, create: false }));
    }
  };

  const handleUpdateSession = async (id, formData) => {
    try {
      setOperationLoading((prev) => ({ ...prev, update: id }));
      console.log(`Updating session ${id}:`, formData);
      const response = await axios.put(
        `${API_BASE_URL}session/update/${id}`,
        formData,
      );
      console.log("Update response:", response.data);

      if (response.data.status) {
        Toast.fire({
          icon: "success",
          title: "Success",
          text: "Session updated successfully",
        });
        fetchSessions();
      } else {
        Toast.fire({
          icon: "error",
          title: "Error",
          text: response.data.message || "Failed to update session",
        });
      }
    } catch (error) {
      console.error("Error updating session:", error);
      console.error("Response data:", error.response?.data);
      Toast.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to update session",
      });
    } finally {
      setOperationLoading((prev) => ({ ...prev, update: null }));
    }
  };

  const handleActivateSession = async (sessionId) => {
    try {
      setOperationLoading((prev) => ({ ...prev, activate: sessionId }));
      const response = await axios.post(`${API_BASE_URL}session/activate`, {
        session_id: sessionId,
      });
      if (response.data.status) {
        Toast.fire({
          icon: "success",
          title: "Success",
          text: "Session activated successfully",
        });
        fetchSessions();
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to activate session",
      });
      console.error("Error activating session:", error);
    } finally {
      setOperationLoading((prev) => ({ ...prev, activate: null }));
    }
  };

  const handleDeactivateSession = async (sessionId) => {
    try {
      setOperationLoading((prev) => ({ ...prev, deactivate: sessionId }));
      const response = await axios.post(`${API_BASE_URL}session/deactivate`, {
        session_id: sessionId,
      });
      if (response.data.status) {
        Toast.fire({
          icon: "success",
          title: "Success",
          text: "Session deactivated successfully",
        });
        fetchSessions();
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to deactivate session",
      });
      console.error("Error deactivating session:", error);
    } finally {
      setOperationLoading((prev) => ({ ...prev, deactivate: null }));
    }
  };

  const handleToggleSession = async (sessionId) => {
    try {
      setOperationLoading((prev) => ({ ...prev, toggle: sessionId }));
      const currentSession = sessions.find((s) => s.id === sessionId);
      console.log(
        "Toggle session:",
        sessionId,
        "Current state:",
        currentSession?.is_open,
      );

      const response = await axios.post(`${API_BASE_URL}session/toggle`, {
        session_id: sessionId,
      });

      console.log("Toggle response:", response.data);

      if (response.data.status) {
        console.log("Toggle successful. New state:", response.data.is_open);
        Toast.fire({
          icon: "success",
          title: "Success",
          text: response.data.message,
        });
        fetchSessions();
      }
    } catch (error) {
      console.error("Error toggling session:", error);
      console.error("Response error:", error.response?.data);
      Toast.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to toggle session state",
      });
    } finally {
      setOperationLoading((prev) => ({ ...prev, toggle: null }));
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (isConfirmed) {
      try {
        setOperationLoading((prev) => ({ ...prev, delete: sessionId }));
        const response = await axios.delete(
          `${API_BASE_URL}session/delete/${sessionId}`,
        );
        if (response.data.status) {
          Toast.fire({
            icon: "success",
            title: "Success",
            text: "Session deleted successfully",
          });
          fetchSessions();
        }
      } catch (error) {
        Toast.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to delete session",
        });
        console.error("Error deleting session:", error);
      } finally {
        setOperationLoading((prev) => ({ ...prev, delete: null }));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="academic-session-management p-4">
      <h3 className="mb-4">Academic Session Management</h3>

      {/* Active Session Card */}
      {activeSession && (
        <MDBCard className="mb-4">
          <MDBCardBody className="bg-light">
            <h5 className="text-success">
              <i className="fas fa-check-circle me-2"></i>
              Current Active Session
            </h5>
            <p className="mb-1">
              <strong>Session Name:</strong> {activeSession.name}
            </p>
            <p className="mb-1">
              <strong>Opened At:</strong> {formatDate(activeSession.opened_at)}
            </p>
            <p className="mb-1">
              <strong>Opened By:</strong> {activeSession.opened_by || "N/A"}
            </p>
          </MDBCardBody>
        </MDBCard>
      )}

      {/* Create New Session Button */}
      <div className="mb-3">
        <MDBBtn
          color="primary"
          onClick={() => handleOpenModal()}
          className="me-2"
          disabled={operationLoading.create}
        >
          {operationLoading.create && (
            <span className="me-2">
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            </span>
          )}
          <i
            className={`fas ${operationLoading.create ? "fa-hourglass" : "fa-plus"} me-2`}
          ></i>
          {operationLoading.create ? "Creating..." : "New Session"}
        </MDBBtn>
      </div>

      {/* Sessions Table */}
      {sessions && sessions.length > 0 ? (
        <div className="table-responsive">
          <MDBTable striped hover>
            <MDBTableHead>
              <tr>
                <th>#</th>
                <th>Session Name</th>
                <th>Status</th>
                <th>Opened At</th>
                <th>Closed At</th>
                <th>Opened By</th>
                <th>Session Actions</th>
                <th>Admin Actions</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {sessions.map((session, index) => (
                <tr key={session.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{session.name}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        session.status === "active"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td>{formatDate(session.opened_at)}</td>
                  <td>{formatDate(session.closed_at)}</td>
                  <td>{session.opened_by || "—"}</td>
                  <td>
                    <MDBBtn
                      size="sm"
                      color={session.is_open == "1" ? "danger" : "success"}
                      onClick={() => handleToggleSession(session.id)}
                      title={
                        session.is_open == "1"
                          ? "Close session"
                          : "Open session for activities"
                      }
                      className="me-2"
                      disabled={operationLoading.toggle === session.id}
                    >
                      {operationLoading.toggle === session.id && (
                        <span className="me-1">
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        </span>
                      )}
                      <i
                        className={`fas ${
                          operationLoading.toggle === session.id
                            ? "fa-hourglass"
                            : session.is_open == "1"
                              ? "fa-door-closed"
                              : "fa-door-open"
                        }`}
                      ></i>
                      {operationLoading.toggle === session.id
                        ? "..."
                        : session.is_open == "1"
                          ? " Close"
                          : " Open"}
                    </MDBBtn>
                  </td>
                  <td>
                    {session.status === "inactive" ? (
                      <MDBBtn
                        size="sm"
                        color="success"
                        onClick={() => handleActivateSession(session.id)}
                        title="Activate this session"
                        className="me-2"
                        disabled={operationLoading.activate === session.id}
                      >
                        {operationLoading.activate === session.id && (
                          <span className="me-2">
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          </span>
                        )}
                        <i
                          className={`fas ${
                            operationLoading.activate === session.id
                              ? "fa-hourglass"
                              : "fa-power-off"
                          }`}
                        ></i>
                        {operationLoading.activate === session.id
                          ? "..."
                          : " Activate"}
                      </MDBBtn>
                    ) : (
                      <MDBBtn
                        size="sm"
                        color="warning"
                        onClick={() => handleDeactivateSession(session.id)}
                        title="Deactivate this session"
                        className="me-2"
                        disabled={operationLoading.deactivate === session.id}
                      >
                        {operationLoading.deactivate === session.id && (
                          <span className="me-2">
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          </span>
                        )}
                        <i
                          className={`fas ${
                            operationLoading.deactivate === session.id
                              ? "fa-hourglass"
                              : "fa-power-off"
                          }`}
                        ></i>
                        {operationLoading.deactivate === session.id
                          ? "..."
                          : " Deactivate"}
                      </MDBBtn>
                    )}
                    <MDBBtn
                      size="sm"
                      color="info"
                      onClick={() => handleOpenModal(session)}
                      title="Edit session"
                      className="me-2"
                      disabled={operationLoading.update === session.id}
                    >
                      {operationLoading.update === session.id && (
                        <span className="me-2">
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        </span>
                      )}
                      <i
                        className={`fas ${
                          operationLoading.update === session.id
                            ? "fa-hourglass"
                            : "fa-edit"
                        }`}
                      ></i>
                      {operationLoading.update === session.id ? "..." : ""}
                    </MDBBtn>
                    <MDBBtn
                      size="sm"
                      color="danger"
                      onClick={() => handleDeleteSession(session.id)}
                      title="Delete session"
                      disabled={operationLoading.delete === session.id}
                    >
                      {operationLoading.delete === session.id && (
                        <span className="me-2">
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        </span>
                      )}
                      <i
                        className={`fas ${
                          operationLoading.delete === session.id
                            ? "fa-hourglass"
                            : "fa-trash"
                        }`}
                      ></i>
                      {operationLoading.delete === session.id ? "..." : ""}
                    </MDBBtn>
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </div>
      ) : (
        <MDBCard>
          <MDBCardBody className="text-center text-muted">
            <p>No sessions found. Create a new session to get started.</p>
          </MDBCardBody>
        </MDBCard>
      )}
    </div>
  );
};

export default AcademicSessionManagement;
