import React, { useState, useEffect } from "react";
import { Toast } from "../../../../components/errorNotifier";
import { loader } from "../../../../components/LoadingSpinner";
import { baseUrl } from "../../../../services/setup";
import request from "superagent";

const RegistrationDocuments = ({ studentId, onDocumentUpdate }) => {
  const [documents, setDocuments] = useState([]);
  const [submittedDocs, setSubmittedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canGenerateMatric, setCanGenerateMatric] = useState(false);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch required documents
      const docsResponse = await request.get(
        `${baseUrl}/registrar/get_documents.php`
      );
      const requiredDocs = docsResponse.body;

      // Fetch student's submitted documents
      const submittedResponse = await request.get(
        `${baseUrl}/registrar/get_submitted_documents.php?student_id=${studentId}`
      );
      const submittedDocuments = submittedResponse.body;

      // Combine the data
      const docsWithSubmission = requiredDocs.map((doc) => ({
        ...doc,
        isSubmitted: submittedDocuments.some((sd) => sd.document_id === doc.id),
        submissionDate: submittedDocuments.find(
          (sd) => sd.document_id === doc.id
        )?.submission_date,
      }));

      setDocuments(docsWithSubmission);
      setSubmittedDocs(submittedDocuments);

      // Check if matriculation number can be generated
      const canGenerate = requiredDocs
        .filter((doc) => !doc.isDeferrable)
        .every((doc) =>
          submittedDocuments.some((sd) => sd.document_id === doc.id)
        );

      setCanGenerateMatric(canGenerate);
      onDocumentUpdate(canGenerate);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Failed to fetch documents",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentToggle = async (docId, isSubmitted) => {
    try {
      loader({ title: "Updating Document Status", text: "please wait..." });

      await request
        .post(`${baseUrl}/registrar/update_document_submission.php`)
        .send({
          student_id: studentId,
          document_id: docId,
          is_submitted: isSubmitted,
        });

      await fetchData(); // Refresh data

      Toast.fire({
        icon: "success",
        title: `Document ${
          isSubmitted ? "marked as submitted" : "marked as not submitted"
        }`,
      });
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Failed to update document status",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Required Registration Documents</h5>
        <span
          className={`badge ${canGenerateMatric ? "bg-success" : "bg-warning"}`}
        >
          {canGenerateMatric
            ? "All required documents submitted"
            : "Missing required documents"}
        </span>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Status</th>
                <th>Submission Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className={!doc.isDeferrable ? "table-warning" : ""}
                >
                  <td>
                    {doc.name}
                    {!doc.isDeferrable && (
                      <span className="badge bg-danger ms-2">Required</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        doc.isDeferrable ? "bg-warning" : "bg-info"
                      }`}
                    >
                      {doc.isDeferrable ? "Deferrable" : "Non-deferrable"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        doc.isSubmitted ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {doc.isSubmitted ? "Submitted" : "Not Submitted"}
                    </span>
                  </td>
                  <td>
                    {doc.submissionDate
                      ? new Date(doc.submissionDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={doc.isSubmitted}
                        onChange={(e) =>
                          handleDocumentToggle(doc.id, e.target.checked)
                        }
                        id={`doc-${doc.id}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`doc-${doc.id}`}
                      >
                        Mark as submitted
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!canGenerateMatric && (
          <div className="alert alert-warning mt-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Note: All non-deferrable documents must be submitted before a
            matriculation number can be generated.
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationDocuments;
