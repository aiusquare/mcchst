import { useState, useEffect } from "react";
import { Toast } from "../../../../components/errorNotifier";
import { loader } from "../../../../components/LoadingSpinner";
import { baseUrl } from "../../../../services/setup";
import request from "superagent";

const DocumentRequirements = () => {
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({
    documentName: "",
    isDeferrable: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await request.get(
        `${baseUrl}/officers/get_required_docs`
      );

      console.log(response.body.data);

      setDocuments(response.body.data || []);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Failed to fetch documents",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.documentName.trim()) {
      Toast.fire({
        icon: "error",
        title: "Document name is required",
      });
      return;
    }

    try {
      loader({
        title: editingId ? "Updating Document" : "Adding Document",
        text: "please wait...",
      });

      const endpoint = editingId
        ? `${baseUrl}/officers/update_required_docs`
        : `${baseUrl}/officers/submit_required_docs`;

      await request.post(endpoint).send({
        ...formData,
        id: editingId,
      });

      Toast.fire({
        icon: "success",
        title: `Document ${editingId ? "updated" : "added"} successfully`,
      });

      setFormData({
        documentName: "",
        isDeferrable: false,
      });
      setEditingId(null);
      fetchDocuments();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Operation failed",
      });
    }
  };

  const handleEdit = (document) => {
    setFormData({
      documentName: document.doc_name,
      isDeferrable: document.deferrable,
      id: document.id,
    });
    setEditingId(document.id);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this document requirement?"
      )
    ) {
      return;
    }

    try {
      loader({ title: "Deleting Document", text: "please wait..." });

      await request.post(`${baseUrl}/officers/delete_document`).send({ id });

      Toast.fire({
        icon: "success",
        title: "Document deleted successfully",
      });

      fetchDocuments();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Failed to delete document",
      });
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                {editingId ? "Edit Document" : "Add Document"}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="documentName" className="form-label">
                    Document Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="documentName"
                    value={formData.documentName}
                    onChange={(e) =>
                      setFormData({ ...formData, documentName: e.target.value })
                    }
                    placeholder="Enter document name"
                  />
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isDeferrable"
                      checked={formData.isDeferrable}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDeferrable: e.target.checked,
                        })
                      }
                    />
                    <label className="form-check-label" htmlFor="isDeferrable">
                      Deferrable Document
                    </label>
                  </div>
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? "Update Document" : "Add Document"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary mt-2"
                      onClick={() => {
                        setFormData({ documentName: "", isDeferrable: false });
                        setEditingId(null);
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Required Documents List</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Document Name</th>
                        <th>Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc, index) => (
                        <tr key={doc.id}>
                          <td>{index + 1}</td>
                          <td>{doc.doc_name}</td>
                          <td>
                            <span
                              className={`badge ${
                                doc.deferrable === "1"
                                  ? "bg-warning"
                                  : "bg-info"
                              }`}
                            >
                              {doc.deferrable === "1"
                                ? "Deferrable"
                                : "Non-deferrable"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(doc)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(doc.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {documents.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-3">
                            No documents found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentRequirements;
