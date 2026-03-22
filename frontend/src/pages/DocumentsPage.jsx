import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDocuments, createDocument } from "../services/documentService";

function DocumentsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("docflowUser"));

  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadDocuments = async () => {
    try {
      setErrorMessage("");
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await createDocument(title, fileName, user.email);
      setSuccessMessage(data.message);
      setTitle("");
      setFileName("");
      await loadDocuments();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleOpenDocument = (id) => {
    navigate(`/documents/${id}`);
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Arial" }}>
      <h1 data-testid="documents-page-title">Documents</h1>

      <button
        data-testid="back-dashboard-button"
        onClick={handleBackToDashboard}
      >
        Back to Dashboard
      </button>

      {(user.role === "Admin" || user.role === "Editor") && (
        <div style={{ marginTop: "24px", marginBottom: "24px" }}>
          <h2>Upload Document</h2>

          <form onSubmit={handleCreateDocument} style={{ maxWidth: "400px" }}>
            <div style={{ marginBottom: "12px" }}>
              <label>Document Title</label>
              <br />
              <input
                data-testid="document-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>File Name</label>
              <br />
              <input
                data-testid="document-file-input"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <button data-testid="upload-document-button" type="submit">
              Create Document
            </button>
          </form>
        </div>
      )}

      {errorMessage && (
        <p data-testid="document-error-message" style={{ color: "red" }}>
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p data-testid="document-success-message" style={{ color: "green" }}>
          {successMessage}
        </p>
      )}

      <div>
        <h2>Document List</h2>

        <table
          data-testid="documents-table"
          border="1"
          cellPadding="10"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>File Name</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Reviewer</th>
              <th>Version</th>
            </tr>
          </thead>

          <tbody>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => handleOpenDocument(doc.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{doc.id}</td>
                  <td>{doc.title}</td>
                  <td>{doc.file_name}</td>
                  <td>{doc.status}</td>
                  <td>{doc.owner_email}</td>
                  <td>{doc.reviewer_email || "-"}</td>
                  <td>{doc.version}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No documents found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DocumentsPage;