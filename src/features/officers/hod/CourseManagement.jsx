import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../../components/errorNotifier";
import { loader } from "../../../components/LoadingSpinner";
import { sessionOfEntry } from "../../../components/Arrays";

// Use local development backend if running on localhost
const getApiUrl = () => {
  return baseUrl;
};

const apiUrl = getApiUrl();

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState(sessionOfEntry);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form filters
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  useEffect(() => {
    fetchSessions();
    fetchProgrammes();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchCourses();
    }
  }, [selectedSession, selectedLevel, selectedSemester]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}course_management/get_sessions`,
        { withCredentials: true },
      );
      if (response.data.status) {
        setSessions(response.data.data || []);
        if (!selectedSession && response.data.data.length > 0) {
          setSelectedSession(response.data.data[0].session);
        }
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgrammes = async () => {
    try {
      console.log(
        "Fetching programmes from:",
        `${apiUrl}course_management/get_hod_programmes`,
      );
      const response = await axios.get(
        `${apiUrl}course_management/get_hod_programmes`,
        { withCredentials: true },
      );
      console.log("Programmes Response:", response.data);
      if (response.data.status) {
        const progs = response.data.data || [];
        console.log("Setting programmes state with:", progs);
        setProgrammes(progs);
      } else {
        console.warn("Failed to fetch programmes:", response.data.message);
        Toast.fire({
          icon: "error",
          title: "Error",
          text: response.data.message || "Failed to load programmes",
        });
      }
    } catch (err) {
      console.error("Error fetching programmes:", err);
      Toast.fire({
        icon: "error",
        title: "Error",
        text:
          "Failed to load programmes: " +
          (err.response?.data?.message || err.message),
      });
    }
  };

  // Test function - call from browser console: testDebug()
  window.testDebugSession = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}course_management/debug_session`,
        { withCredentials: true },
      );
      console.log("=== HOD SESSION DEBUG ===");
      console.log("Session Keys:", response.data.session_keys);
      console.log("Office Role:", response.data.office_role_check);
      console.log("Department:", response.data.department_check);
      console.log("Full Session:", response.data.full_session);
      console.log("========================");
      return response.data;
    } catch (err) {
      console.error("Debug Error:", err.response?.data || err.message);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSession) params.append("session", selectedSession);
      if (selectedLevel) params.append("level", selectedLevel);
      if (selectedSemester) params.append("semester", selectedSemester);

      const response = await axios.get(
        `${apiUrl}course_management/list_courses?${params}`,
        { withCredentials: true },
      );

      if (response.data.status) {
        setCourses(response.data.data || []);
        setError("");
      } else {
        setError(response.data.message || "Failed to fetch courses");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch courses.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSaveCourse = (savedCourse) => {
    if (editingCourse) {
      setCourses(
        courses.map((c) => (c.id === savedCourse.id ? savedCourse : c)),
      );
    } else {
      setCourses([...courses, savedCourse]);
    }
    handleCloseModal();
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        loader({ title: "Deleting..." });
        const response = await axios.post(
          `${apiUrl}course_management/delete_course`,
          { course_id: courseId },
          { withCredentials: true },
        );

        if (response.data.status) {
          setCourses(courses.filter((c) => c.id !== courseId));
          Toast.fire({
            icon: "success",
            title: "Course deleted successfully!",
          });
        }
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to delete course.";
        Toast.fire({ icon: "error", title: message });
      }
    }
  };

  if (loading && courses.length === 0) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Course Management</h4>
          <div>
            <button
              className="btn btn-sm btn-info me-2"
              onClick={() => {
                console.log("Programmes state:", programmes);
                window.testDebugSession?.();
              }}
              title="Debug: Check programme loading"
            >
              <i className="fas fa-bug me-1"></i>Test
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleOpenModal()}
            >
              <i className="fas fa-plus me-2"></i>Add New Course
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card-body border-bottom">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">Session</label>
              <select
                className="form-select"
                value={selectedSession}
                onChange={(e) => {
                  setSelectedSession(e.target.value);
                  setSelectedLevel("");
                  setSelectedSemester("");
                }}
              >
                <option value="">Select Session</option>
                {sessions.map((session) => (
                  <option key={session.name} value={session.name}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Level</label>
              <select
                className="form-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="100">100 (First Year)</option>
                <option value="200">200 (Second Year)</option>
                <option value="300">300 (Third Year)</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Semester</label>
              <select
                className="form-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">All Semesters</option>
                <option value="1">First Semester</option>
                <option value="2">Second Semester</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {courses.length > 0 ? (
            <CourseList
              courses={courses}
              onEdit={handleOpenModal}
              onDelete={handleDeleteCourse}
            />
          ) : (
            <p className="text-center text-muted">
              {selectedSession
                ? "No courses found. Click 'Add New Course' to begin."
                : "Please select a session to view courses."}
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CourseModal
          course={editingCourse}
          session={selectedSession}
          sessions={sessions}
          programmes={programmes}
          onClose={handleCloseModal}
          onSave={handleSaveCourse}
        />
      )}
    </div>
  );
};

const CourseList = ({ courses, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: "120px" }}>Code</th>
            <th>Course Title</th>
            <th style={{ width: "150px" }}>Programme</th>
            <th style={{ width: "100px" }}>Semester</th>
            <th style={{ width: "80px" }}>Units</th>
            <th style={{ width: "120px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>
                <strong>{course.course_code}</strong>
              </td>
              <td>{course.course_title}</td>
              <td>
                <small>{course.programme || "N/A"}</small>
              </td>
              <td>
                <span className="badge bg-success">
                  {course.semester === "1" ? "1st" : "2nd"} Sem
                </span>
              </td>
              <td>{course.units} units</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => onEdit(course)}
                  title="Edit"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(course.id)}
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CourseModal = ({
  course,
  session,
  sessions = [],
  programmes = [],
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    course_code: course?.course_code || "",
    course_title: course?.course_title || "",
    programme: course?.programme || "",
    semester: course?.semester || "1",
    session: course?.session || session || "",
    units: course?.units || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Debug logs
  console.log("CourseModal - Programmes received:", programmes);
  console.log("CourseModal - Programmes count:", programmes?.length);
  console.log("CourseModal - Session:", session);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const validateForm = () => {
    if (
      !formData.course_code ||
      !formData.course_title ||
      !formData.programme ||
      !formData.semester ||
      !formData.session ||
      !formData.units
    ) {
      setFormError("All fields are required");
      return false;
    }

    const units = parseInt(formData.units);
    if (isNaN(units) || units <= 0) {
      setFormError("Units must be a positive number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    loader({ title: course ? "Updating course..." : "Creating course..." });

    try {
      const url = course
        ? `${apiUrl}course_management/update_course`
        : `${apiUrl}course_management/create_course`;

      const payload = {
        ...formData,
        units: parseInt(formData.units),
        ...(course && { course_id: course.id }),
      };

      const response = await axios.post(url, payload, {
        withCredentials: true,
      });

      if (response.data.status) {
        Toast.fire({
          icon: "success",
          title: `Course ${course ? "updated" : "created"} successfully!`,
        });
        onSave(response.data.data);
      } else {
        setFormError(
          response.data.message ||
            `Failed to ${course ? "update" : "create"} course`,
        );
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        `Failed to ${course ? "update" : "create"} course.`;
      setFormError(message);
      Toast.fire({ icon: "error", title: message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {course ? "Edit Course" : "Add New Course"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {formError && (
              <div className="alert alert-danger" role="alert">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="course_code" className="form-label fw-bold">
                    Course Code
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="course_code"
                    name="course_code"
                    value={formData.course_code}
                    onChange={handleChange}
                    placeholder="e.g., GST101"
                    disabled={course ? true : false}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="units" className="form-label fw-bold">
                    Units
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="units"
                    name="units"
                    value={formData.units}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g., 3"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="course_title" className="form-label fw-bold">
                  Course Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="course_title"
                  name="course_title"
                  value={formData.course_title}
                  onChange={handleChange}
                  placeholder="e.g., General Studies"
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="programme" className="form-label fw-bold">
                    Programme <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    className="form-select"
                    id="programme"
                    name="programme"
                    value={formData.programme}
                    onChange={handleChange}
                  >
                    <option value="">Select Programme</option>
                    {programmes.map((prog) => (
                      <option key={prog.programme} value={prog.programme}>
                        {prog.programme}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="semester" className="form-label fw-bold">
                    Semester <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    className="form-select"
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                  >
                    <option value="1">First Semester</option>
                    <option value="2">Second Semester</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving
                    ? course
                      ? "Updating..."
                      : "Creating..."
                    : course
                      ? "Update Course"
                      : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
