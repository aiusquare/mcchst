import React, { useState, useEffect } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBInput,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from "mdb-react-ui-kit";
import { Toast } from "../../components/errorNotifier";
import { baseUrl } from "../../services/setup";
import request from "superagent";
import "./ExitCardList.css";

const ExitCardList = () => {
  const [hostelStudents, setHostelStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    room: "",
    session: "",
  });

  useEffect(() => {
    const fetchHostelStudents = async () => {
      try {
        setLoading(true);

        // Fetch bookings (joined with admission/room/hostel data)
        const bookingsRes = await request.get(`${baseUrl}/booking`);
        const bookings = bookingsRes.body || [];

        // Fetch bedspaces to resolve bed_number (instead of id)
        let bedspacesById = {};
        try {
          const bedspaceRes = await request.get(`${baseUrl}/bedspace`);
          bedspacesById = (bedspaceRes.body || []).reduce((acc, bs) => {
            if (bs.id) acc[bs.id] = bs;
            return acc;
          }, {});
        } catch (e) {
          bedspacesById = {};
        }

        // Bulk guardian lookup via profiles/get_profiles (single request)
        let guardianByEmail = {};
        const emails = bookings
          .map((b) => (b.Email || b.user_id || "").toString())
          .filter(Boolean);
        if (emails.length) {
          try {
            const guardianRes = await request
              .post(`${baseUrl}/profiles/get_profiles`)
              .type("application/json")
              .send({ emails });
            const list = guardianRes.body?.data || [];
            guardianByEmail = list.reduce((acc, item) => {
              const key = (item.Email || item.email || "")
                .toString()
                .toLowerCase();
              const phone =
                item.ParentOrGuardianPhone ||
                item.ParentMobile ||
                item.parentPhone ||
                item.ParentPhone ||
                "";
              if (key && phone) acc[key] = phone;
              return acc;
            }, {});
          } catch (e) {
            guardianByEmail = {};
          }
        }

        // Use only approved/completed bookings for exit cards
        const approvedBookings = bookings.filter((booking) =>
          ["approved", "completed"].includes(
            (booking.status || "").toLowerCase(),
          ),
        );

        // Map available fields
        const studentsWithDetails = approvedBookings.map((booking) => {
          const bed = bedspacesById[booking.bed_space_id];
          const guardianPhone =
            guardianByEmail[
              (booking.Email || booking.user_id || "").toLowerCase()
            ] ||
            booking.GuardianPhoneNumber ||
            booking.ParentPhoneNumber ||
            booking.guardianPhone ||
            booking.parentPhone ||
            "N/A";

          return {
            id: booking.id,
            fullname:
              booking.Fullname ||
              booking.fullname ||
              booking.Email ||
              booking.user_id ||
              "N/A",
            matricNumber:
              booking.MatricNumber || booking.matric_number || "N/A",
            hostelBlock:
              booking.block_name || booking.block || bed?.block_name || "N/A",
            roomNo:
              booking.room_number ||
              booking.roomName ||
              booking.room_no ||
              booking.roomNo ||
              bed?.room_number ||
              "N/A",
            bedSpace:
              bed?.bed_number ||
              booking.bed_space_name ||
              booking.bedNumber ||
              booking.bed_space ||
              booking.bed_space_id ||
              "N/A",
            studentPhone:
              booking.PhoneNumber ||
              booking.phone_number ||
              booking.Phone ||
              "N/A",
            paymentStatus:
              booking.payment_status || booking.paymentStatus || "N/A",
            guardianPhone,
            email: booking.Email || booking.user_id || "N/A",
            session: booking.academic_session_id || booking.session || "N/A",
          };
        });

        setHostelStudents(studentsWithDetails);
        setFilteredStudents(studentsWithDetails);
      } catch (err) {
        console.error("Error fetching hostel students:", err);
        Toast.fire({
          icon: "error",
          title: "Failed to load hostel students",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHostelStudents();
  }, []);

  const filterStudents = () => {
    let filtered = [...hostelStudents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.fullname.toLowerCase().includes(query) ||
          student.matricNumber.toLowerCase().includes(query) ||
          student.roomNo.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query),
      );
    }

    // Room filter
    if (filterOptions.room) {
      filtered = filtered.filter((student) =>
        student.roomNo.toLowerCase().includes(filterOptions.room.toLowerCase()),
      );
    }

    // Session filter
    if (filterOptions.session) {
      filtered = filtered.filter((student) =>
        student.session.includes(filterOptions.session),
      );
    }

    setFilteredStudents(filtered);
  };

  const handleExportCSV = () => {
    // Define CSV headers
    const headers = [
      "Fullname",
      "Matric Number",
      "Block",
      "Room No",
      "Bedspace",
      "Payment Status",
      "Student's Phone Number",
      "Guardian/Parent's Phone Number",
    ];

    // Format data for CSV
    const csvData = filteredStudents.map((student) => [
      student.fullname,
      student.matricNumber,
      student.hostelBlock,
      student.roomNo,
      student.bedSpace,
      student.paymentStatus,
      student.studentPhone,
      student.guardianPhone,
    ]);

    // Create CSV string
    const csvString = [
      headers.join(","), // header row
      ...csvData.map((row) => row.map((val) => `"${val}"`).join(",")), // data rows
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `hostel_exit_card_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    Toast.fire({
      icon: "success",
      title: "Exit card list exported successfully",
    });
  };

  return (
    <div className="exit-card-list-container">
      <MDBCard>
        <MDBCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <MDBCardTitle>Hostel Students Exit Card List</MDBCardTitle>
            <MDBBtn
              color="success"
              onClick={handleExportCSV}
              disabled={filteredStudents.length === 0}
            >
              <i className="fas fa-download me-2"></i>
              Download Exit Card List
            </MDBBtn>
          </div>

          {/* Filters Section */}
          <div className="row mb-4">
            <div className="col-md-4">
              <MDBInput
                label="Search by name, matric, or room"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <MDBInput
                label="Filter by Room"
                type="text"
                value={filterOptions.room}
                onChange={(e) =>
                  setFilterOptions({ ...filterOptions, room: e.target.value })
                }
              />
            </div>
            <div className="col-md-3">
              <MDBInput
                label="Filter by Session"
                type="text"
                value={filterOptions.session}
                onChange={(e) =>
                  setFilterOptions({
                    ...filterOptions,
                    session: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <MDBBtn
                color="light"
                onClick={() => {
                  setSearchQuery("");
                  setFilterOptions({ room: "", session: "" });
                }}
              >
                Clear Filters
              </MDBBtn>
            </div>
          </div>

          {/* Stats Section */}
          <div className="row mb-3">
            <div className="col-md-12">
              <div className="alert alert-info">
                <strong>Total Hostel Students:</strong>{" "}
                {filteredStudents.length}
                {filteredStudents.length !== hostelStudents.length && (
                  <span className="ms-2">
                    (Filtered from {hostelStudents.length} total)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="alert alert-warning text-center">
              No hostel students found
            </div>
          ) : (
            <div className="table-responsive">
              <MDBTable hover striped>
                <MDBTableHead>
                  <tr>
                    <th>#</th>
                    <th>Fullname</th>
                    <th>Matric Number</th>
                    <th>Block</th>
                    <th>Room No</th>
                    <th>Bedspace</th>
                    <th>Payment Status</th>
                    <th>Student's Phone</th>
                    <th>Guardian/Parent's Phone</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>{student.fullname}</td>
                      <td>{student.matricNumber}</td>
                      <td>{student.hostelBlock}</td>
                      <td>{student.roomNo}</td>
                      <td>{student.bedSpace}</td>
                      <td>{student.paymentStatus}</td>
                      <td>{student.studentPhone}</td>
                      <td>{student.guardianPhone}</td>
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>
            </div>
          )}
        </MDBCardBody>
      </MDBCard>
    </div>
  );
};

export default ExitCardList;
