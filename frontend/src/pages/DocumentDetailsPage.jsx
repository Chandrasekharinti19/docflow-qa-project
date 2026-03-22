import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchDocumentById,
  fetchReviewers,
  assignReviewer,
  approveDocument,
  rejectDocument,
  fetchDocumentAuditLogs,
} from "../services/documentService";

function DocumentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("docflowUser"));

  const [document, setDocument] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
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

  const loadAuditLogs = async () => {
    try {
      const data = await fetchDocumentAuditLogs(id);
      setAuditLogs(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    loadDocument();
    loadReviewers();
    loadAuditLogs();
  }, [id]);

  const refreshAll = async () => {
    await loadDocument();
    await loadAuditLogs();
  };

  const handleAssignReviewer = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await assignReviewer(id, selectedReviewer, user.email);
      setSuccessMessage(data.message);
      await refreshAll();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleApprove = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await approveDocument(id, user.email);
      setSuccessMessage(data.message);
      await refreshAll();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleReject = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await rejectDocument(id, user.email, rejectionNotes);
      setSuccessMessage(data.message);
      setRejectionNotes("");
      await refreshAll();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleBack = () => {
    navigate("/documents");
  };

  const canAssignReviewer = user.role === "Admin" || user.role === "Editor";
  const canReview =
    user.role === "Reviewer" &&
    document?.reviewer_email === user.email &&
    document?.status === "Pending";

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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

      {canAssignReviewer && (
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

      {canReview && (
        <div style={{ marginTop: "24px" }}>
          <h2>Review Actions</h2>

          <button
            data-testid="approve-document-button"
            onClick={handleApprove}
            style={{ marginRight: "12px" }}
          >
            Approve
          </button>

          <div style={{ marginTop: "16px" }}>
            <textarea
              data-testid="reject-notes-input"
              placeholder="Enter rejection notes"
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              rows="4"
              style={{ width: "100%", maxWidth: "500px", padding: "8px" }}
            />
          </div>

          <button
            data-testid="reject-document-button"
            onClick={handleReject}
            style={{ marginTop: "12px" }}
          >
            Reject
          </button>
        </div>
      )}

      {errorMessage && (
        <p
          data-testid="document-details-error"
          style={{ color: "red", marginTop: "16px" }}
        >
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

      <div style={{ marginTop: "32px" }}>
        <h2 data-testid="audit-history-title">Audit History</h2>

        {auditLogs.length > 0 ? (
          <div data-testid="audit-history-list">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "12px",
                  marginBottom: "12px",
                  borderRadius: "6px",
                }}
              >
                <p>
                  <strong>Action:</strong> {log.action}
                </p>
                <p>
                  <strong>Actor:</strong> {log.actor_email}
                </p>
                <p>
                  <strong>Notes:</strong> {log.notes || "-"}
                </p>
                <p>
                  <strong>Time:</strong> {formatDate(log.created_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p data-testid="no-audit-history">No audit history found.</p>
        )}
      </div>
    </div>
  );
}

export default DocumentDetailsPage;