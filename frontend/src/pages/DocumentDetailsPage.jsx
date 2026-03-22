import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchDocumentById,
  fetchReviewers,
  assignReviewer,
} from "../services/documentService";

function DocumentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("docflowUser"));

  const [document, setDocument] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadDocument = async () => {
    try {
      const data = await fetchDocumentById(id);
      setDocument(data);
      setSelectedReviewer(data.reviewer_email || "");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const loadReviewers = async () => {
    try {
      const data = await fetchReviewers();
      setReviewers(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    loadDocument();
    loadReviewers();
  }, [id]);

  const handleAssignReviewer = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await assignReviewer(id, selectedReviewer, user.email);
      setSuccessMessage(data.message);
      setDocument(data.document);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleBack = () => {
    navigate("/documents");
  };

  if (!document) {
    return (
      <div style={{ padding: "24px", fontFamily: "Arial" }}>
        <p>Loading document details...</p>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", fontFamily: "Arial" }}>
      <h1 data-testid="document-details-title">Document Details</h1>

      <button data-testid="back-documents-button" onClick={handleBack}>
        Back to Documents
      </button>

      <div style={{ marginTop: "24px" }}>
        <p data-testid="document-id">ID: {document.id}</p>
        <p data-testid="document-title">Title: {document.title}</p>
        <p data-testid="document-file-name">File Name: {document.file_name}</p>
        <p data-testid="document-status">Status: {document.status}</p>
        <p data-testid="document-owner">Owner: {document.owner_email}</p>
        <p data-testid="document-reviewer">
          Reviewer: {document.reviewer_email || "-"}
        </p>
        <p data-testid="document-version">Version: {document.version}</p>
      </div>

      {(user.role === "Admin" || user.role === "Editor") && (
        <div style={{ marginTop: "24px" }}>
          <h2>Assign Reviewer</h2>

          <select
            data-testid="reviewer-select"
            value={selectedReviewer}
            onChange={(e) => setSelectedReviewer(e.target.value)}
            style={{ padding: "8px", minWidth: "250px", marginRight: "12px" }}
          >
            <option value="">Select Reviewer</option>
            {reviewers.map((reviewer) => (
              <option key={reviewer.id} value={reviewer.email}>
                {reviewer.name} ({reviewer.email})
              </option>
            ))}
          </select>

          <button
            data-testid="assign-reviewer-button"
            onClick={handleAssignReviewer}
          >
            Assign Reviewer
          </button>
        </div>
      )}

      {errorMessage && (
        <p data-testid="document-details-error" style={{ color: "red", marginTop: "16px" }}>
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          data-testid="document-details-success"
          style={{ color: "green", marginTop: "16px" }}
        >
          {successMessage}
        </p>
      )}
    </div>
  );
}

export default DocumentDetailsPage;