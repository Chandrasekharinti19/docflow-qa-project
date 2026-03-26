import { test, expect } from "@playwright/test";
import {
  createDocumentApi,
  assignReviewerApi,
  approveDocumentApi,
} from "../utils/apiClient";
import { queryDb } from "../utils/dbClient";
import { users } from "../utils/testData";
import { deleteDocumentApi } from "../utils/apiClient";

test("DB validation: document and audit logs are updated correctly", async ({ request }) => {
  const uniqueTitle = `DB Validation Document ${Date.now()}`;

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

  await approveDocumentApi(request, documentId, users.reviewer.email);

  const documentRows = await queryDb(
    `
      SELECT id, title, status, owner_email, reviewer_email
      FROM documents
      WHERE id = $1
    `,
    [documentId]
  );

  expect(documentRows.length).toBe(1);
  expect(documentRows[0].title).toBe(uniqueTitle);
  expect(documentRows[0].status).toBe("Approved");
  expect(documentRows[0].owner_email).toBe(users.editor.email);
  expect(documentRows[0].reviewer_email).toBe(users.reviewer.email);

  const auditRows = await queryDb(
    `
      SELECT action, actor_email, notes
      FROM audit_logs
      WHERE document_id = $1
      ORDER BY id ASC
    `,
    [documentId]
  );

  const actions = auditRows.map((row) => row.action);
  expect(actions).toContain("REVIEWER_ASSIGNED");
  expect(actions).toContain("APPROVED");

  const approvalRow = auditRows.find((row) => row.action === "APPROVED");
  expect(approvalRow.actor_email).toBe(users.reviewer.email);
});

test("DB validation: soft deleted document remains in DB with deleted flags", async ({ request }) => {
  const uniqueTitle = `Soft Delete DB ${Date.now()}`;

  const created = await createDocumentApi(
    request,
    uniqueTitle,
    "fixtures/sample.pdf",
    users.editor.email
  );

  const documentId = created.document.id;

  const { response } = await deleteDocumentApi(
    request,
    documentId,
    users.editor.email
  );

  expect(response.status()).toBe(200);

  const documentRows = await queryDb(
    `
      SELECT id, title, is_deleted, deleted_at, deleted_by
      FROM documents
      WHERE id = $1
    `,
    [documentId]
  );

  expect(documentRows.length).toBe(1);
  expect(documentRows[0].title).toBe(uniqueTitle);
  expect(documentRows[0].is_deleted).toBe(true);
  expect(documentRows[0].deleted_at).toBeTruthy();
  expect(documentRows[0].deleted_by).toBe(users.editor.email);

  const auditRows = await queryDb(
    `
      SELECT action, actor_email, notes
      FROM audit_logs
      WHERE document_id = $1
      ORDER BY id DESC
    `,
    [documentId]
  );

  const softDeleteRow = auditRows.find(
    (row) => row.action === "DOCUMENT_SOFT_DELETED"
  );

  expect(softDeleteRow).toBeTruthy();
  expect(softDeleteRow.actor_email).toBe(users.editor.email);
});