export async function fetchDocuments(search = "") {
  const url = search
    ? `http://localhost:5000/api/documents?search=${encodeURIComponent(search)}`
    : "http://localhost:5000/api/documents";

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch documents");
  }

  return data;
}

export async function createDocument(title, file, ownerEmail) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("ownerEmail", ownerEmail);
  formData.append("file", file);

  const response = await fetch("http://localhost:5000/api/documents", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to upload document");
  }

  return data;
}

export async function fetchDocumentById(id) {
  const response = await fetch(`http://localhost:5000/api/documents/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch document");
  }

  return data;
}

export async function fetchReviewers() {
  const response = await fetch("http://localhost:5000/api/documents/reviewers");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch reviewers");
  }

  return data;
}

export async function assignReviewer(id, reviewerEmail, actorEmail) {
  const response = await fetch(
    `http://localhost:5000/api/documents/${id}/assign-reviewer`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reviewerEmail, actorEmail }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to assign reviewer");
  }

  return data;
}

export async function approveDocument(id, actorEmail) {
  const response = await fetch(`http://localhost:5000/api/documents/${id}/approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ actorEmail }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to approve document");
  }

  return data;
}

export async function rejectDocument(id, actorEmail, notes) {
  const response = await fetch(`http://localhost:5000/api/documents/${id}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ actorEmail, notes }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reject document");
  }

  return data;
}

export async function fetchDocumentAuditLogs(id) {
  const response = await fetch(`http://localhost:5000/api/documents/${id}/audit-logs`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch audit logs");
  }

  return data;
}

export function getDocumentDownloadUrl(id) {
  return `http://localhost:5000/api/documents/${id}/download`;
}

export async function deleteDocument(id, actorEmail) {
  const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ actorEmail }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete document");
  }

  return data;
}