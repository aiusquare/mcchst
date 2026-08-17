import React, { useEffect, useMemo, useState } from "react";
import request from "superagent";
import { Toast } from "../../components/errorNotifier";
import { baseUrl } from "../../services/setup";

const StationariesRegistration = () => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await request.get(`${baseUrl}stationaries/list`);
      setItems(res.body?.data || []);
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Failed to load stationaries",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => (it.name || "").toLowerCase().includes(q));
  }, [filter, items]);

  const resetForm = () => {
    setName("");
    setQuantity("1");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    const qtyNum = Number(quantity);
    if (!trimmed) {
      Toast.fire({ icon: "warning", title: "Enter a stationery name" });
      return;
    }
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      Toast.fire({
        icon: "warning",
        title: "Quantity must be greater than zero",
      });
      return;
    }
    try {
      setSaving(true);
      await request
        .post(`${baseUrl}stationaries/create`)
        .type("application/json")
        .send({ name: trimmed, quantity_required: qtyNum });
      resetForm();
      Toast.fire({ icon: "success", title: "Stationery saved" });
      fetchItems();
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Failed to save stationery",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      setDeletingId(id);
      await request
        .post(`${baseUrl}stationaries/delete`)
        .type("application/json")
        .send({ id });
      fetchItems();
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err?.response?.body?.error || "Failed to remove stationery",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container py-3">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
        <div>
          <h5 className="mb-0">Registrar Stationaries Registration</h5>
          <small className="text-muted">
            Capture stationery name and required quantity.
          </small>
        </div>
        <div className="d-flex gap-2">
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder="Filter by name"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: "200px" }}
          />
        </div>
      </div>

      <form className="card mb-3" onSubmit={handleAdd}>
        <div className="card-body row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Stationery name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Clearance form, Pen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Quantity required</label>
            <input
              type="number"
              min="1"
              step="1"
              className="form-control"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100">
              {saving ? "Saving..." : "Add"}
            </button>
          </div>
        </div>
      </form>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Registered stationaries</h6>
            <small className="text-muted">
              Stored on server — name and required quantity
            </small>
          </div>
          {loading ? (
            <div className="text-muted small">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-muted small">
              No stationaries captured yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Quantity required</th>
                    <th>Added</th>
                    <th style={{ width: "80px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity_required}</td>
                      <td>{new Date(item.created_at).toLocaleString()}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemove(item.id)}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? "Removing..." : "Remove"}
                        </button>
                      </td>
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

export default StationariesRegistration;
