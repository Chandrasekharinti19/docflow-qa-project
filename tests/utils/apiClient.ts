import { APIRequestContext, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:5000";

function getMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".zip":
      return "application/zip";
    case ".txt":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

export async function createDocumentApi(
  request: APIRequestContext,
  title: string,
  filePath: string,
  ownerEmail: string
) {
  const resolvedPath = path.resolve(filePath);

  const response = await request.post(`${apiBaseUrl}/api/documents`, {
    multipart: {
      title,
      ownerEmail,
      file: {
        name: path.basename(resolvedPath),
        mimeType: getMimeType(resolvedPath),
        buffer: fs.readFileSync(resolvedPath),
      },
    },
  });

  const body = await response.text();

  expect(response.ok(), `createDocumentApi failed: ${response.status()} ${body}`).toBeTruthy();

  return JSON.parse(body);  
}

export async function createDocumentApiExpectFailure(
  request: APIRequestContext,
  title: string,
  filePath: string,
  ownerEmail: string
) {
  const resolvedPath = path.resolve(filePath);

  const response = await request.post(`${apiBaseUrl}/api/documents`, {
    multipart: {
      title,
      ownerEmail,
      file: {
        name: path.basename(resolvedPath),
        mimeType: getMimeType(resolvedPath),
        buffer: fs.readFileSync(resolvedPath),
      },
    },
  });

  return response;
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

  const body = await response.text();

  expect(response.ok(), `assignReviewerApi failed: ${response.status()} ${body}`).toBeTruthy();

  return JSON.parse(body);
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

  const body = await response.text();

  expect(response.ok(), `approveDocumentApi failed: ${response.status()} ${body}`).toBeTruthy();

  return JSON.parse(body);
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

export async function deleteDocumentApi(
  request: APIRequestContext,
  id: number,
  actorEmail: string
) {
  const response = await request.delete(
    `${apiBaseUrl}/api/documents/${id}`,
    {
      data: { actorEmail },
    }
  );

  const body = await response.text();

  expect(response.ok(), `deleteDocumentApi failed: ${response.status()} ${body}`).toBeTruthy();

  return JSON.parse(body);
}