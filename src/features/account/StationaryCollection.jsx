import React, { useEffect, useMemo, useState } from "react";
import request from "superagent";
import { Toast } from "../../components/errorNotifier";
import { baseUrl } from "../../services/setup";

const StationaryCollection = () => {
  const [email, setEmail] = useState("");
  const [student, setStudent] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [stationaries, setStationaries] = useState([]);
  const [loadingStationaries, setLoadingStationaries] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchStationaries();
  }, []);

  const fetchStationaries = async () => {
    try {
      setLoadingStationaries(true);
      const res = await request.get(`${baseUrl}stationaries/list`);
      const rows = Array.isArray(res.body?.data) ? res.body.data : [];
      // Normalize ids to numbers to make selection comparisons work
      const normalized = rows.map((r) => ({
        ...r,
        id: Number(r.id),
        quantity_required: Number(r.quantity_required),
      }));
      setStationaries(normalized);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Failed to load stationaries",
      });
    } finally {
      setLoadingStationaries(false);
    }
  };

  const fetchStudent = async () => {
    if (!email.trim()) {
      Toast.fire({ icon: "warning", title: "Enter student email" });
      return;
    }
    try {
      setLoadingStudent(true);
      const res = await request
        .post(`${baseUrl}clearance/get`)
        .type("application/json")
        .send({ email: email.trim(), role: "accounting" });
      setStudent(res.body?.student || null);
      setEmail(res.body?.student?.Email || email.trim());
      loadHistory(res.body?.student?.Email || email.trim());
    } catch (err) {
      setStudent(null);
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Student not found",
      });
    } finally {
      setLoadingStudent(false);
    }
  };

  const loadHistory = async (targetEmail) => {
    if (!targetEmail) return;
    try {
      setLoadingHistory(true);
      const res = await request
        .get(`${baseUrl}stationaries/received_by_user`)
        .query({ user_id: targetEmail });
      setHistory(res.body?.data || []);
    } catch (err) {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const availableOptions = useMemo(() => {
    const chosenIds = entries.map((e) => Number(e.stationary_id));
    return stationaries.filter((s) => !chosenIds.includes(Number(s.id)));
  }, [entries, stationaries]);

  const addEntry = () => {
    const idNum = Number(selectedId);
    if (!idNum) {
      Toast.fire({ icon: "warning", title: "Select a stationary" });
      return;
    }
    const item = stationaries.find((s) => Number(s.id) === idNum);
    if (!item) return;
    setEntries([
      ...entries,
      {
        stationary_id: item.id,
        stationary_name: item.name,
        quantity_required: item.quantity_required,
        quantity_received: item.quantity_required,
      },
    ]);
    setSelectedId("");
  };

  const updateQty = (id, value) => {
    const qty = Number(value);
    setEntries((prev) =>
      prev.map((e) =>
        e.stationary_id === id
          ? {
              ...e,
              quantity_received: Number.isFinite(qty)
                ? qty
                : e.quantity_received,
            }
          : e
      )
    );
  };

  const removeEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.stationary_id !== id));
  };

  const saveCollection = async () => {
    if (!student?.Email) {
      Toast.fire({ icon: "warning", title: "Fetch a student first" });
      return;
    }
    if (!entries.length) {
      Toast.fire({ icon: "warning", title: "Add at least one stationery" });
      return;
    }
    try {
      setSaving(true);
      await request
        .post(`${baseUrl}stationaries/receive`)
        .type("application/json")
        .send({
          user_id: student.Email,
          items: entries.map((e) => ({
            stationary_id: e.stationary_id,
            quantity_received: e.quantity_received,
          })),
        });
      Toast.fire({ icon: "success", title: "Stationaries recorded" });
      setEntries([]);
      loadHistory(student.Email);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h5 className="mb-0">Stationary Collection</h5>
          <small className="text-muted">
            Record stationaries received from students
          </small>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body row g-2 align-items-end">
          <div className="col-md-5">
            <label className="form-label">Student email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
            />
          </div>
          <div className="col-md-3">
            <button
              type="button"
              className="btn btn-primary mt-3"
              onClick={fetchStudent}
              disabled={loadingStudent}
            >
              {loadingStudent ? "Fetching..." : "Fetch student"}
            </button>
          </div>
          {student && (
            <div className="col-md-4">
              <div className="small text-muted">Student</div>
              <div className="fw-semibold">{student.Fullname}</div>
              <div className="small">{student.Email}</div>
              <div className="small text-muted">
                {student.Department} • {student.Programme}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <label className="form-label">Select stationary</label>
              <select
                className="form-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={loadingStationaries || availableOptions.length === 0}
              >
                <option value="">-- choose --</option>
                {availableOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Required: {s.quantity_required})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={addEntry}
                disabled={loadingStationaries}
              >
                Add to list
              </button>
            </div>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Stationaries to record</h6>
              <small className="text-muted">Qty received can be adjusted</small>
            </div>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Qty required</th>
                    <th style={{ width: "140px" }}>Qty received</th>
                    <th style={{ width: "80px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.stationary_id}>
                      <td>{e.stationary_name}</td>
                      <td>{e.quantity_required}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="form-control form-control-sm"
                          value={e.quantity_received}
                          onChange={(ev) =>
                            updateQty(e.stationary_id, ev.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeEntry(e.stationary_id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-end mb-3">
        <button
          type="button"
          className="btn btn-success"
          onClick={saveCollection}
          disabled={saving || !entries.length || !student?.Email}
        >
          {saving ? "Saving..." : "Save stationaries"}
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">History for student</h6>
            {loadingHistory && <small className="text-muted">Loading...</small>}
          </div>
          {history.length === 0 ? (
            <div className="text-muted small">
              No stationaries recorded yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Qty required</th>
                    <th>Qty received</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td>{h.stationary_name}</td>
                      <td>{h.quantity_required}</td>
                      <td>{h.quantity_received}</td>
                      <td>{new Date(h.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationaryCollection;
