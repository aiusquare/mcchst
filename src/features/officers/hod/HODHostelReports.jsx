import React, { useEffect, useState, useMemo } from "react";
import request from "superagent";
import { baseUrl } from "../../../services/setup";
import { Toast } from "../../../components/errorNotifier";
import { loader } from "../../../components/LoadingSpinner";

const HODHostelReports = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      loader({ title: "Loading hostel report", text: "please wait..." });
      // Adjust endpoint if your API path differs
      const res = await request.get(`${baseUrl}booking/report`);
      const body = res.body || {};

      if (body.status === false) {
        throw new Error(body.message || "Failed to load bookings");
      }

      setBookings(body.data || []);
      setTotalPaid(Number(body.total_paid || 0));
      setTotalUnpaid(Number(body.total_unpaid || 0));

      Toast.fire({ icon: "success", title: "Hostel report loaded" });
    } catch (err) {
      console.error(err);
      const message = err?.message || "Failed to fetch hostel report";
      setError(message);
      Toast.fire({ icon: "error", title: message });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) => {
      return (
        (b.Fullname || "").toLowerCase().includes(q) ||
        (b.Department || "").toLowerCase().includes(q) ||
        (b.Programme || "").toLowerCase().includes(q) ||
        (b.Level || "").toLowerCase().includes(q)
      );
    });
  }, [bookings, search]);

  return (
    <div className="container my-4">
      <h4 className="mb-3">Hostel — Bookings Report</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <small className="text-muted">Total Paid Bookings</small>
              <h5 className="mt-2">{totalPaid}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <small className="text-muted">Total Unpaid Bookings</small>
              <h5 className="mt-2 text-danger">{totalUnpaid}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <small className="text-muted">Total Bookings</small>
              <h5 className="mt-2">{bookings.length}</h5>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Bookings</h5>
            <div style={{ minWidth: 320 }}>
              <div className="input-group">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search by name, department, programme or level"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setSearch("")}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Payment Status</th>
                  <th>Fullname</th>
                  <th>Department</th>
                  <th>Programme</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.payment_status?.toLowerCase() === "paid"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      >
                        {b.payment_status}
                      </span>
                    </td>
                    <td>{b.Fullname}</td>
                    <td>{b.Department}</td>
                    <td>{b.Programme}</td>
                    <td>{b.Level}</td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      {loading ? "Loading..." : "No bookings found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODHostelReports;
