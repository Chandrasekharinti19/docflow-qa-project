import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchDocuments,
  createDocument,
  getDocumentDownloadUrl,
  deleteDocument,
} from "../services/documentService";

function DocumentsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("docflowUser"));

  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const allowedExtensions = ["pdf", "docx", "xlsx", "jpg", "jpeg", "png", "zip"];
  const maxFileSizeBytes = 10 * 1024 * 1024;

  const getFileExtension = (name) => {
    if (!name || !name.includes(".")) return "";
    return name.split(".").pop().toLowerCase();
  };

  const loadDocuments = async (search = "") => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await fetchDocuments(search);
      setDocuments(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!title.trim()) {
      setErrorMessage("Document title is required");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please select a file to upload");
      return;
    }

    const extension = getFileExtension(selectedFile.name);

    if (!allowedExtensions.includes(extension)) {
      setErrorMessage(
        "Invalid file type. Allowed: pdf, docx, xlsx, jpg, jpeg, png, zip"
      );
      return;
    }

    if (selectedFile.size > maxFileSizeBytes) {
      setErrorMessage("File is too large. Maximum allowed size is 10 MB");
      return;
    }

    try {
      const data = await createDocument(title.trim(), selectedFile, user.email);
      setSuccessMessage(data.message);
      setTitle("");
      setSelectedFile(null);
      const fileInput = document.getElementById("document-file-input");
      if (fileInput) fileInput.value = "";
      await loadDocuments(searchTerm);
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

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadDocuments(searchTerm);
  };

  const handleClearSearch = async () => {
    setSearchTerm("");
    await loadDocuments("");
  };

  const handleDeleteDocument = async (e, id) => {
    e.stopPropagation();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await deleteDocument(id, user.email);
      setSuccessMessage(data.message);
      await loadDocuments(searchTerm);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const canCreate = user.role === "Admin" || user.role === "Editor";
  const canDelete = user.role === "Admin" || user.role === "Editor";

  return (
    <div style={{ padding: "24px", fontFamily: "Arial" }}>
      <h1 data-testid="documents-page-title">Documents</h1>

      <p data-testid="documents-page-role">
        Logged in as: <strong>{user.role}</strong>
      </p>

      <button
        data-testid="back-dashboard-button"
        onClick={handleBackToDashboard}
      >
        Back to Dashboard
      </button>

      {canCreate && (
        <div style={{ marginTop: "24px", marginBottom: "24px" }}>
          <h2>Upload Document</h2>

          <form onSubmit={handleCreateDocument} style={{ maxWidth: "500px" }}>
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
              <label>Select File</label>
              <br />
              <input
                data-testid="document-file-input"
                id="document-file-input"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                style={{ width: "100%", padding: "8px" }}
              />
              <p style={{ fontSize: "14px", marginTop: "6px" }}>
                Allowed types: pdf, docx, xlsx, jpg, jpeg, png, zip. Max size: 10 MB
              </p>
              {selectedFile && (
                <p data-testid="selected-file-name" style={{ fontSize: "14px" }}>
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <button data-testid="upload-document-button" type="submit">
              Upload Document
            </button>
          </form>
        </div>
      )}

      {!canCreate && (
        <p data-testid="read-only-message" style={{ marginTop: "24px" }}>
          You have read-only access to documents.
        </p>
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

      <div style={{ marginTop: "24px", marginBottom: "24px" }}>
        <h2>Search Documents</h2>

        <form onSubmit={handleSearch}>
          <input
            data-testid="document-search-input"
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "300px",
              padding: "8px",
              marginRight: "12px",
            }}
          />

          <button
            data-testid="document-search-button"
            type="submit"
            style={{ marginRight: "12px" }}
          >
            Search
          </button>

          <button
            data-testid="document-clear-search-button"
            type="button"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        </form>
      </div>

      <div>
        <h2>Document List</h2>

        {loading ? (
          <p data-testid="documents-loading">Loading documents...</p>
        ) : (
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
                <th>Type</th>
                <th>Size (bytes)</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Reviewer</th>
                <th>Version</th>
                <th>Open</th>
                <th>Delete</th>
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
                    <td>{doc.file_type || getFileExtension(doc.file_name) || "-"}</td>
                    <td>{doc.file_size_bytes ?? "-"}</td>
                    <td>{doc.status}</td>
                    <td>{doc.owner_email}</td>
                    <td>{doc.reviewer_email || "-"}</td>
                    <td>{doc.version}</td>
                    <td>
                      <a
                        href={getDocumentDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`open-document-${doc.id}`}
                      >
                        Open
                      </a>
                    </td>
                    <td>
                      {canDelete && doc.status === "Pending" ? (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDocument(e, doc.id)}
                          data-testid={`delete-document-${doc.id}`}
                          title="Delete document"
                          style={{
                            cursor: "pointer",
                            border: "none",
                            background: "transparent",
                            fontSize: "18px",
                          }}
                        >
                          🗑️
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" data-testid="no-documents-message">
                    No documents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;