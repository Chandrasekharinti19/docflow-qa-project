import { test, expect } from "@playwright/test";
import {
  createDocumentApi,
  createDocumentApiExpectFailure,
  fetchDocumentsApi,
  assignReviewerApi,
  approveDocumentApi,
  fetchAuditLogsApi,
  deleteDocumentApi,
} from "../utils/apiClient";
import { users } from "../utils/testData";

test("API: create document and fetch it by search", async ({ request }) => {
  const uniqueTitle = `API Document ${Date.now()}`;

  const createResponse = await createDocumentApi(
    request,
    uniqueTitle,
    "fixtures/sample.pdf",
    users.editor.email
  );

  expect(createResponse.message).toBe("Document uploaded successfully");
  expect(createResponse.document.title).toBe(uniqueTitle);
  expect(createResponse.document.status).toBe("Pending");

  const documents = await fetchDocumentsApi(request, uniqueTitle);

  const matchedDocument = documents.find(
    (doc: { title: string }) => doc.title === uniqueTitle
  );

  expect(matchedDocument).toBeTruthy();
});

test("API: assign reviewer and approve document", async ({ request }) => {
  const uniqueTitle = `Approval API Document ${Date.now()}`;

  const created = await createDocumentApi(
    request,
    uniqueTitle,
    "fixtures/sample.pdf",
    users.editor.email
  );

  const documentId = created.document.id;

  const assigned = await assignReviewerApi(
    request,
    documentId,
    users.reviewer.email,
    users.editor.email
  );

  expect(assigned.message).toBe("Reviewer assigned successfully");
  expect(assigned.document.reviewer_email).toBe(users.reviewer.email);

  const approved = await approveDocumentApi(
    request,
    documentId,
    users.reviewer.email
  );

  expect(approved.message).toBe("Document approved successfully");
  expect(approved.document.status).toBe("Approved");

  const auditLogs = await fetchAuditLogsApi(request, documentId);
  const actions = auditLogs.map((log: { action: string }) => log.action);

  expect(actions).toContain("REVIEWER_ASSIGNED");
  expect(actions).toContain("APPROVED");
});

test("API: reject unsupported file type", async ({ request }) => {
  const response = await createDocumentApiExpectFailure(
    request,
    "Invalid File",
    "fixtures/invalid.txt",
    users.editor.email
  );

  expect(response.status()).toBe(400);

  const data = await response.json();
  expect(data.message).toContain("Unsupported file type");
});

test("API: editor can delete pending document", async ({ request }) => {
  const uniqueTitle = `Delete API ${Date.now()}`;

  const created = await createDocumentApi(
    request,
    uniqueTitle,
    "fixtures/sample.pdf",
    users.editor.email
  );

  const documentId = created.document.id;

  const { response, data } = await deleteDocumentApi(
    request,
    documentId,
    users.editor.email
  );

  expect(response.status()).toBe(200);
  expect(data.message).toBe("Document deleted successfully");
});

test("API: cannot delete approved document", async ({ request }) => {
  const uniqueTitle = `No Delete Approved ${Date.now()}`;

  const created = await createDocumentApi(
    request,
    uniqueTitle,
    "fixtures/sample.pdf",
    users.editor.email
  );

  const documentId = created.document.id;

  await assignReviewerApi(
    request,
    documentId,
    users.reviewer.email,
    users.editor.email
  );

  await approveDocumentApi(
    request,
    documentId,
    users.reviewer.email
  );

  const { response, data } = await deleteDocumentApi(
    request,
    documentId,
    users.editor.email
  );

  expect(response.status()).toBe(400);
  expect(data.message).toContain("Only pending documents can be deleted");
});

test("API: cannot delete non-existing document", async ({ request }) => {
  const { response, data } = await deleteDocumentApi(
    request,
    999999,
    users.editor.email
  );

  expect(response.status()).toBe(404);
  expect(data.message).toBe("Document not found");
});