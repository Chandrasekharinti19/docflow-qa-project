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