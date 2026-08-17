import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../../components/errorNotifier";
import { loader } from "../../../components/LoadingSpinner";

const apiUrl = baseUrl;

const StudentCourseRegistration = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState({
    fullname: "",
    matric_number: "",
    level: "",
    department: "",
    email: "",
  });
  const [filters, setFilters] = useState({
    session: "",
    semester: "",
    level: "",
  });
  const [sessions, setSessions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  useEffect(() => {
    if (filters.session && filters.semester && filters.level) {
      fetchCourses();
    }
  }, [filters]);

  const fetchStudentInfo = async () => {
    try {
      // Get student info from localStorage or session
      const email =
        localStorage.getItem("studentEmail") || sessionStorage.getItem("email");
      const fullname = localStorage.getItem("studentName") || "";
      const matric_number = localStorage.getItem("matricNumber") || "";
      const level = localStorage.getItem("level") || "";
      const department = localStorage.getItem("department") || "";

      setStudentInfo({
        fullname,
        matric_number,
        level,
        department,
        email,
      });

      if (!level) {
        setError("Unable to determine your academic level");
        setLoading(false);
        return;
      }

      // Fetch available sessions
      fetchSessions(department);
    } catch (err) {
      console.error("Error fetching student info:", err);
    }
  };

  const fetchSessions = async (dept) => {
    try {
      // This would ideally come from the backend
      // For now, we'll use mock data or derive from active sessions
      const activeSessions = [
        { session: "2023/2024" },
        { session: "2024/2025" },
      ];
      setSessions(activeSessions);
      if (activeSessions.length > 0) {
        setFilters((prev) => ({
          ...prev,
          session: activeSessions[0].session,
        }));
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        level: filters.level,
        semester: filters.semester,
        session: filters.session,
      });

      const response = await axios.get(
        `${apiUrl}course_management/list_courses?${params}`,
        { withCredentials: true },
      );

      if (response.data.status) {
        setCourses(response.data.data || []);
        setError("");
      } else {
        setError(response.data.message || "Failed to fetch courses");
        setCourses([]);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch courses.";
      setError(message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map((c) => c.id));
    }
  };

  const calculateTotalUnits = () => {
    return courses
      .filter((c) => selectedCourses.includes(c.id))
      .reduce((total, course) => total + course.units, 0);
  };

  const handleSubmitRegistration = async () => {
    if (selectedCourses.length === 0) {
      Toast.fire({
        icon: "warning",
        title: "Please select at least one course",
      });
      return;
    }

    setSubmitting(true);
    loader({ title: "Registering courses..." });

    try {
      const registrations = selectedCourses.map((courseId) => ({
        course_id: courseId,
        student_email: studentInfo.email,
        matric_number: studentInfo.matric_number,
        level: filters.level,
        semester: filters.semester,
        session: filters.session,
        department: studentInfo.department,
      }));

      const response = await axios.post(
        `${apiUrl}student_registration/register_courses`,
        { registrations },
        { withCredentials: true },
      );

      if (response.data.status) {
        Toast.fire({
          icon: "success",
          title: "Courses registered successfully!",
        });
        setSelectedCourses([]);
        // Optionally refresh the list
        fetchCourses();
      } else {
        Toast.fire({
          icon: "error",
          title: response.data.message || "Failed to register courses",
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to register courses.";
      Toast.fire({ icon: "error", title: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateExamCard = async () => {
    try {
      loader({ title: "Generating exam card..." });
      const response = await axios.get(
        `${apiUrl}student_exam/generate_exam_card`,
        {
          params: {
            student_email: studentInfo.email,
            level: filters.level,
            semester: filters.semester,
            session: filters.session,
          },
          withCredentials: true,
        },
      );

      if (response.data.status) {
        // Download PDF or display exam card
        Toast.fire({
          icon: "success",
          title: "Exam card generated successfully!",
        });
        // Implement download logic here
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err.response?.data?.message || "Failed to generate exam card",
      });
    }
  };

  if (!studentInfo.email) {
    return (
      <div className="alert alert-danger">
        Please log in to register for courses
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* Student Info Card */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">Student Information</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Name:</strong> {studentInfo.fullname}
              </p>
              <p>
                <strong>Matric Number:</strong> {studentInfo.matric_number}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Level:</strong> {studentInfo.level}
              </p>
              <p>
                <strong>Department:</strong> {studentInfo.department}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">Course Registration Filters</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">Session</label>
              <select
                className="form-select"
                value={filters.session}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, session: e.target.value }))
                }
              >
                <option value="">Select Session</option>
                {sessions.map((s) => (
                  <option key={s.session} value={s.session}>
                    {s.session}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Semester</label>
              <select
                className="form-select"
                value={filters.semester}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, semester: e.target.value }))
                }
              >
                <option value="">Select Semester</option>
                <option value="1">First Semester</option>
                <option value="2">Second Semester</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Level</label>
              <select
                className="form-select"
                value={filters.level}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, level: e.target.value }))
                }
              >
                <option value="">Select Level</option>
                <option value="100">100 (First Year)</option>
                <option value="200">200 (Second Year)</option>
                <option value="300">300 (Third Year)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Card */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Available Courses</h5>
          {courses.length > 0 && (
            <span className="badge bg-success">
              {courses.length} Courses Available
            </span>
          )}
        </div>

        {error && (
          <div className="card-body">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}

        {loading && (
          <div className="card-body text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <>
            <div className="card-body">
              {/* Select All Checkbox */}
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAll"
                    checked={selectedCourses.length === courses.length}
                    onChange={handleSelectAll}
                  />
                  <label
                    className="form-check-label fw-bold"
                    htmlFor="selectAll"
                  >
                    {selectedCourses.length === courses.length
                      ? "Deselect All"
                      : "Select All"}
                  </label>
                </div>
              </div>

              {/* Courses List */}
              <div className="row g-3">
                {courses.map((course) => (
                  <div key={course.id} className="col-md-6">
                    <div className="card h-100 border">
                      <div className="card-body">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`course-${course.id}`}
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleCourseToggle(course.id)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`course-${course.id}`}
                          >
                            <strong>{course.course_code}</strong> -{" "}
                            {course.course_title}
                            <br />
                            <small className="text-muted">
                              {course.units} units
                            </small>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Card */}
            <div className="card-footer bg-light">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <p className="mb-0">
                    <strong>
                      Courses Selected: {selectedCourses.length} /{" "}
                      {courses.length}
                    </strong>
                    <br />
                    <strong>Total Units: {calculateTotalUnits()}</strong>
                  </p>
                </div>
                <div className="col-md-6 text-end">
                  <button
                    className="btn btn-primary me-2"
                    onClick={handleSubmitRegistration}
                    disabled={submitting || selectedCourses.length === 0}
                  >
                    {submitting ? "Registering..." : "Register Courses"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleGenerateExamCard}
                    disabled={submitting}
                  >
                    Generate Exam Card
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && courses.length === 0 && !error && (
          <div className="card-body">
            <p className="text-center text-muted">
              Please select Session, Semester, and Level to view available
              courses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourseRegistration;
