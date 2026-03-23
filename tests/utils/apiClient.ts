import { APIRequestContext, expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:5000";

export async function createDocumentApi(
  request: APIRequestContext,
  title: string,
  fileName: string,
  ownerEmail: string
) {
  const response = await request.post(`${apiBaseUrl}/api/documents`, {
    data: { title, fileName, ownerEmail },
  });

  expect(response.ok()).toBeTruthy();
  return response.json();
}

export async function fetchDocumentsApi(request: APIRequestContext, search = "") {
  const url = search
    ? `${apiBaseUrl}/api/documents?search=${encodeURIComponent(search)}`
    : `${apiBaseUrl}/api/documents`;

  const response = await request.get(url);
  expect(response.ok()).toBeTruthy();
  return response.json();
}

export async function assignReviewerApi(
  request: APIRequestContext,
  id: number,
  reviewerEmail: string,
  actorEmail: string
) {
  const response = await request.patch(
    `${apiBaseUrl}/api/documents/${id}/assign-reviewer`,
    {
      data: { reviewerEmail, actorEmail },
    }
  );

  expect(response.ok()).toBeTruthy();
  return response.json();
}

export async function approveDocumentApi(
  request: APIRequestContext,
  id: number,
  actorEmail: string
) {
  const response = await request.patch(
    `${apiBaseUrl}/api/documents/${id}/approve`,
    {
      data: { actorEmail },
    }
  );

  expect(response.ok()).toBeTruthy();
  return response.json();
}

export async function rejectDocumentApi(
  request: APIRequestContext,
  id: number,
  actorEmail: string,
  notes: string
) {
  const response = await request.patch(
    `${apiBaseUrl}/api/documents/${id}/reject`,
    {
      data: { actorEmail, notes },
    }
  );

  expect(response.ok()).toBeTruthy();
  return response.json();
}

export async function fetchAuditLogsApi(
  request: APIRequestContext,
  id: number
) {
  const response = await request.get(
    `${apiBaseUrl}/api/documents/${id}/audit-logs`
  );

  expect(response.ok()).toBeTruthy();
  return response.json();
}