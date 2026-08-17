import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import request from "superagent";
import editIcon from "../../../pictures/edit.png";
import { Toast } from "../../../components/errorNotifier";
import { baseUrl } from "../../../services/setup";
import {
  ADMIN_PAGE_ACCESS_OPTIONS,
  getUserAdditionalPages,
} from "../../../utils/access-control";
import "./styles.css";

const pageLabels = ADMIN_PAGE_ACCESS_OPTIONS.flatMap((group) => group.pages).reduce(
  (labels, page) => ({
    ...labels,
    [page.path]: page.label,
  }),
  {}
);

const UsersTable = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!init) {
      handleDataFetch();
    }
  }, [init]);

  // Filter users when search query changes
  useEffect(() => {
    if (rows.length > 0) {
      const filtered = rows.filter(
        (user) =>
          user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${user.access}/${user.mode}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          getUserAdditionalPages(user)
            .map((page) => pageLabels[page] || page)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredRows(filtered);
    }
  }, [searchQuery, rows]);

  const handleDataFetch = async () => {
    try {
      const response = await request.get(baseUrl + "admin/get_users");
      const basicDetails = Array.isArray(response.body)
        ? response.body
        : response.body?.data || [];
      setRows(basicDetails);
      setInit(true);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Calculate user statistics
  const userStats = {
    totalUsers: rows.length,
    activeUsers: rows.filter((user) => user.status === "active").length,
    pendingUsers: rows.filter((user) => user.status === "pending").length,
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "status-badge status-active";
      case "inactive":
        return "status-badge status-inactive";
      default:
        return "status-badge status-pending";
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.user_id === updatedUser.user_id ? { ...row, ...updatedUser } : row
      )
    );
    Toast.fire({
      icon: "success",
      title: "User updated successfully",
    });
  };

  return (
    <div className="users-container">
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">Users Management</h2>
        <p className="page-subtitle">Manage and monitor user accounts</p>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="stats-card shadow-1">
            <div className="stat-value">{userStats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stats-card">
            <div className="stat-value">{userStats.activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stats-card">
            <div className="stat-value">{userStats.pendingUsers}</div>
            <div className="stat-label">Pending Users</div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar mb-4">
        <div className="row g-0 align-items-center">
          <div className="col">
            <div className="search-container">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search users by name, ID, status, or privileges..."
                  aria-label="Search users"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="col-auto ms-3">
            <button
              className="btn btn-success action-button"
              onClick={() => navigate("/admin/create-staff")}
            >
              CREATE USER ACCOUNT
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Status</th>
              <th>Privileges</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((user, index) => (
              <tr key={index}>
                <td>
                  <div className="fw-semibold">{user.fullname}</div>
                </td>
                <td>
                  <div className="text-muted">{user.user_id}</div>
                </td>
                <td>
                  <span className={getStatusBadgeClass(user.status)}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <span className="privileges-tag">
                    {user.access}/{user.mode}
                  </span>
                  {getUserAdditionalPages(user).length > 0 && (
                    <div className="additional-pages-list">
                      +{" "}
                      {getUserAdditionalPages(user)
                        .map((page) => pageLabels[page] || page)
                        .join(", ")}
                    </div>
                  )}
                </td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => {
                      navigate("/admin/edit-users", {
                        state: { userData: user },
                      });
                    }}
                  >
                    <img src={editIcon} alt="Edit user" className="edit-icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Can be implemented later */}
      <div className="d-flex justify-content-end mt-4">
        <nav aria-label="Users pagination">
          <ul className="pagination">
            <li className="page-item disabled">
              <a className="page-link" href="#" tabIndex="-1">
                Previous
              </a>
            </li>
            <li className="page-item active">
              <a className="page-link" href="#">
                1
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                2
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                3
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default UsersTable;
