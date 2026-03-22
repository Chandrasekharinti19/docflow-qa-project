export async function fetchDocuments() {
  const response = await fetch("http://localhost:5000/api/documents");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch documents");
  }

  return data;
}

export async function createDocument(title, fileName, ownerEmail) {
  const response = await fetch("http://localhost:5000/api/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, fileName, ownerEmail }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create document");
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