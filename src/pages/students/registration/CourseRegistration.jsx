import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../../components/errorNotifier";
import { loader } from "../../../components/LoadingSpinner";

// Mock function to get student details - replace with actual logic
const getStudentDetails = () => {
  return {
    id: localStorage.getItem("studentId"),
    programmeId: localStorage.getItem("programmeId"),
    level: localStorage.getItem("level"),
    hasCarryOver: localStorage.getItem("hasCarryOver") === "true", // Example
  };
};

const StudentCourseRegistration = () => {
  const [defaultCourses, setDefaultCourses] = useState([]);
  const [electiveCourses, setElectiveCourses] = useState([]);
  const [carryOverCourses, setCarryOverCourses] = useState([]);
  const [selectedElectives, setSelectedElectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentDetails = getStudentDetails();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!studentDetails.id || !studentDetails.programmeId) {
        setError("Could not retrieve your details. Please log in again.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch all relevant courses
        const response = await axios.get(
          `${baseUrl}courses/student/${studentDetails.id}`
        );
        const { default_courses, elective_courses, carry_over_courses } =
          response.data.data;

        setDefaultCourses(default_courses || []);
        setElectiveCourses(elective_courses || []);
        setCarryOverCourses(carry_over_courses || []);
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch course data.";
        setError(message);
        Toast.fire({ icon: "error", title: message });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [studentDetails.id, studentDetails.programmeId]);

  const handleElectiveChange = (courseId) => {
    setSelectedElectives((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitRegistration = async () => {
    const registeredCourseIds = [
      ...defaultCourses.map((c) => c.id),
      ...carryOverCourses.map((c) => c.id),
      ...selectedElectives,
    ];

    if (registeredCourseIds.length === 0) {
      Toast.fire({
        icon: "warning",
        title: "You have not selected any courses.",
      });
      return;
    }

    try {
      loader({ title: "Submitting..." });
      await axios.post(`${baseUrl}courses/register`, {
        student_id: studentDetails.id,
        course_ids: registeredCourseIds,
      });
      Toast.fire({
        icon: "success",
        title: "Course registration submitted successfully!",
      });
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to submit registration.";
      Toast.fire({ icon: "error", title: message });
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading course information...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const allCourses = [
    ...defaultCourses,
    ...carryOverCourses,
    ...electiveCourses.filter((c) => selectedElectives.includes(c.id)),
  ];

  const totalUnits = allCourses.reduce(
    (sum, course) => sum + parseInt(course.credit_units, 10),
    0
  );

  return (
    <div className="container my-4">
      <div className="card shadow-sm printable-area">
        <div className="card-header">
          <h4 className="mb-0">Course Registration Form</h4>
        </div>
        <div className="card-body">
          <h5 className="mb-3">Compulsory Courses</h5>
          <CourseTable courses={defaultCourses} />

          {carryOverCourses.length > 0 && (
            <>
              <h5 className="mt-4 mb-3 text-danger">Carry-Over Courses</h5>
              <CourseTable courses={carryOverCourses} />
            </>
          )}

          {electiveCourses.length > 0 && (
            <>
              <h5 className="mt-4 mb-3">Elective Courses</h5>
              <p>
                Select the elective courses you wish to offer this semester.
              </p>
              <ElectiveCourseSelector
                courses={electiveCourses}
                selected={selectedElectives}
                onChange={handleElectiveChange}
              />
            </>
          )}

          <div className="mt-4 p-3 bg-light rounded">
            <h5>Total Credit Units: {totalUnits}</h5>
          </div>
        </div>
      </div>

      <div className="text-center mt-4 no-print">
        <button
          className="btn btn-secondary me-3"
          onClick={() => window.history.back()}
        >
          Back
        </button>
        <button className="btn btn-info me-3" onClick={handlePrint}>
          <i className="fas fa-print me-2"></i>Print Form
        </button>
        <button className="btn btn-primary" onClick={handleSubmitRegistration}>
          Submit Registration
        </button>
      </div>
      <style>{`
        @media print {
          .no-print {
            display: none;
          }
          .printable-area {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

const CourseTable = ({ courses }) => {
  if (courses.length === 0) {
    return <p className="text-muted">No courses in this category.</p>;
  }
  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Course Code</th>
            <th>Course Title</th>
            <th>Credit Units</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.course_code}</td>
              <td>{course.course_title}</td>
              <td>{course.credit_units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ElectiveCourseSelector = ({ courses, selected, onChange }) => {
  return (
    <div>
      {courses.map((course) => (
        <div className="form-check" key={course.id}>
          <input
            className="form-check-input"
            type="checkbox"
            id={`elective-${course.id}`}
            checked={selected.includes(course.id)}
            onChange={() => onChange(course.id)}
          />
          <label className="form-check-label" htmlFor={`elective-${course.id}`}>
            {course.course_code} - {course.course_title} ({course.credit_units}{" "}
            units)
          </label>
        </div>
      ))}
    </div>
  );
};

export default StudentCourseRegistration;
