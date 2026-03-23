import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { DocumentsPage } from "../pages/DocumentsPage";
import { DocumentDetailsPage } from "../pages/DocumentDetailsPage";
import { users } from "../utils/testData";

test("editor assigns reviewer and reviewer approves document", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);
  const documentDetailsPage = new DocumentDetailsPage(page);

  const uniqueTitle = `Workflow Document ${Date.now()}`;
  const fileName = `workflow-${Date.now()}.pdf`;

  // Login as editor
  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);

  await dashboardPage.expectLoaded();
  await dashboardPage.goToDocuments();

  // Create document
  await documentsPage.expectLoaded();
  await documentsPage.createDocument(uniqueTitle, fileName);
  await documentsPage.expectSuccessMessage();

  // Search and open document
  await documentsPage.searchDocument(uniqueTitle);
  await documentsPage.expectDocumentVisible(uniqueTitle);
  await documentsPage.openDocumentByTitle(uniqueTitle);

  // Assign reviewer
  await documentDetailsPage.expectLoaded();
  await documentDetailsPage.assignReviewer(users.reviewer.email);
  await documentDetailsPage.expectReviewer(users.reviewer.email);
  await documentDetailsPage.expectAuditAction("REVIEWER_ASSIGNED");

  // Logout as editor
  await page.goto("/dashboard");
  await dashboardPage.expectLoaded();
  await dashboardPage.logout();
  await loginPage.expectLoginPageVisible();

  // Login as reviewer
  await loginPage.login(users.reviewer.email, users.reviewer.password);
  await dashboardPage.expectLoaded();
  await dashboardPage.expectRole("Reviewer");
  await dashboardPage.goToDocuments();

  // Search and open same document
  await documentsPage.expectLoaded();
  await documentsPage.searchDocument(uniqueTitle);
  await documentsPage.expectDocumentVisible(uniqueTitle);
  await documentsPage.openDocumentByTitle(uniqueTitle);

  // Approve document
  await documentDetailsPage.expectLoaded();
  await documentDetailsPage.approveDocument();
  await documentDetailsPage.expectStatus("Approved");
  await documentDetailsPage.expectAuditAction("APPROVED");
});