import { test, expect } from "@playwright/test";
import {
  createDocumentApi,
  fetchDocumentsApi,
  assignReviewerApi,
  approveDocumentApi,
  fetchAuditLogsApi,
} from "../utils/apiClient";
import { users } from "../utils/testData";

test("API: create document and fetch it by search", async ({ request }) => {
  const uniqueTitle = `API Document ${Date.now()}`;
  const fileName = `api-${Date.now()}.pdf`;

  const createResponse = await createDocumentApi(
    request,
    uniqueTitle,
    fileName,
    users.editor.email
  );

  expect(createResponse.message).toBe("Document created successfully");
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
  const fileName = `approval-api-${Date.now()}.pdf`;

  const created = await createDocumentApi(
    request,
    uniqueTitle,
    fileName,
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