import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { DocumentsPage } from "../pages/DocumentsPage";
import { users } from "../utils/testData";

test("editor can upload and search a document", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  const uniqueTitle = `Playwright Upload ${Date.now()}`;

  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);

  await dashboardPage.expectLoaded();
  await dashboardPage.goToDocuments();

  await documentsPage.expectLoaded();
  await documentsPage.createDocument(uniqueTitle, "fixtures/sample.pdf");
  await documentsPage.expectSuccessMessage();
  await documentsPage.searchDocument(uniqueTitle);
  await documentsPage.expectDocumentVisible(uniqueTitle);
});

test("viewer sees read-only documents access", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  await loginPage.goto();
  await loginPage.login(users.viewer.email, users.viewer.password);

  await dashboardPage.expectLoaded();
  await dashboardPage.goToDocuments();

  await documentsPage.expectLoaded();
  await documentsPage.expectReadOnlyMessage();
});

test("editor cannot upload unsupported file type", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);

  await dashboardPage.goToDocuments();
  await documentsPage.expectLoaded();

  await documentsPage.createDocument("Invalid File Test", "fixtures/invalid.txt");
  await documentsPage.expectErrorMessage("Invalid file type");
});

test("editor cannot upload file larger than 10MB", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);

  await dashboardPage.goToDocuments();
  await documentsPage.expectLoaded();

  await documentsPage.createDocument("Large File Test", "fixtures/large.jpg");
  await documentsPage.expectErrorMessage("File is too large");
});

test("editor can delete a pending document", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  const uniqueTitle = `Delete Me ${Date.now()}`;

  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);

  await dashboardPage.expectLoaded();
  await dashboardPage.goToDocuments();

  await documentsPage.expectLoaded();
  await documentsPage.createDocument(uniqueTitle, "fixtures/sample.pdf");
  await documentsPage.expectSuccessMessage();

  await documentsPage.searchDocument(uniqueTitle);
  await documentsPage.expectDocumentVisible(uniqueTitle);

  const documentId = await documentsPage.getDocumentIdByTitle(uniqueTitle);

  await documentsPage.expectDeleteButtonForDocument(documentId);
  await documentsPage.deleteDocumentById(documentId);
  await documentsPage.expectSuccessMessage();

  await documentsPage.searchDocument(uniqueTitle);
  await documentsPage.expectDocumentNotVisible(uniqueTitle);
});

test("viewer cannot see delete button for pending document", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  const uniqueTitle = `Viewer Delete Check ${Date.now()}`;

  // create doc as editor first
  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);
  await dashboardPage.goToDocuments();
  await documentsPage.expectLoaded();
  await documentsPage.createDocument(uniqueTitle, "fixtures/sample.pdf");
  await documentsPage.expectSuccessMessage();
  await documentsPage.searchDocument(uniqueTitle);
  const documentId = await documentsPage.getDocumentIdByTitle(uniqueTitle);

  await page.goto("/dashboard");
  await dashboardPage.logout();
  await loginPage.expectLoginPageVisible();

  // verify as viewer
  await loginPage.login(users.viewer.email, users.viewer.password);
  await dashboardPage.expectLoaded();
  await dashboardPage.goToDocuments();

  await documentsPage.expectLoaded();
  await documentsPage.searchDocument(uniqueTitle);
  await documentsPage.expectDocumentVisible(uniqueTitle);
  await documentsPage.expectNoDeleteButtonForDocument(documentId);
});

test("approved document does not show delete button", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  const uniqueTitle = `Approved Delete Check ${Date.now()}`;

  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);
  await dashboardPage.goToDocuments();
  await documentsPage.expectLoaded();
  await documentsPage.createDocument(uniqueTitle, "fixtures/sample.pdf");
  await documentsPage.expectSuccessMessage();
  await documentsPage.searchDocument(uniqueTitle);

  const documentId = await documentsPage.getDocumentIdByTitle(uniqueTitle);
  await documentsPage.openDocumentByTitle(uniqueTitle);

  // assign reviewer
  await page.getByTestId("reviewer-select").selectOption(users.reviewer.email);
  await page.getByTestId("assign-reviewer-button").click();

  await page.goto("/dashboard");
  await dashboardPage.logout();
  await loginPage.expectLoginPageVisible();

  // approve as reviewer
  await loginPage.login(users.reviewer.email, users.reviewer.password);
  await dashboardPage.expectLoaded();
  await dashboardPage.goToDocuments();
  await documentsPage.searchDocument(uniqueTitle);
  await documentsPage.openDocumentByTitle(uniqueTitle);
  await page.getByTestId("approve-document-button").click();
  await expect(page.getByTestId("document-status")).toContainText("Approved");

  await page.goto("/dashboard");
  await dashboardPage.logout();
  await loginPage.expectLoginPageVisible();

  // verify no delete as editor
  await loginPage.login(users.editor.email, users.editor.password);
  await dashboardPage.expectLoaded();
  await dashboardPage.goToDocuments();
  await documentsPage.searchDocument(uniqueTitle);
  await documentsPage.expectNoDeleteButtonForDocument(documentId);
});

test("editor can see open link for uploaded document", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  const uniqueTitle = `Open Link Check ${Date.now()}`;

  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);

  await dashboardPage.expectLoaded();
  await dashboardPage.goToDocuments();

  await documentsPage.expectLoaded();
  await documentsPage.createDocument(uniqueTitle, "fixtures/sample.pdf");
  await documentsPage.expectSuccessMessage();

  await documentsPage.searchDocument(uniqueTitle);
  const documentId = await documentsPage.getDocumentIdByTitle(uniqueTitle);
  await documentsPage.expectOpenLinkForDocument(documentId);
});

test("editor can download uploaded document", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  const uniqueTitle = `Download Check ${Date.now()}`;

  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);

  await dashboardPage.expectLoaded();
  await dashboardPage.goToDocuments();

  await documentsPage.expectLoaded();
  await documentsPage.createDocument(uniqueTitle, "fixtures/sample.pdf");
  await documentsPage.expectSuccessMessage();

  await documentsPage.searchDocument(uniqueTitle);
  await documentsPage.expectDocumentVisible(uniqueTitle);

  const documentId = await documentsPage.getDocumentIdByTitle(uniqueTitle);
  const download = await documentsPage.downloadDocumentById(documentId);

  expect(download.suggestedFilename()).toBe("sample.pdf");
});

test("viewer cannot delete document via UI", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  const uniqueTitle = `Viewer Delete UI ${Date.now()}`;

  // create as editor
  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);
  await dashboardPage.goToDocuments();
  await documentsPage.createDocument(uniqueTitle, "fixtures/sample.pdf");
  await documentsPage.expectSuccessMessage();
  await documentsPage.searchDocument(uniqueTitle);

  const documentId = await documentsPage.getDocumentIdByTitle(uniqueTitle);

  // logout
  await page.goto("/dashboard");
  await dashboardPage.logout();

  // login as viewer
  await loginPage.login(users.viewer.email, users.viewer.password);
  await dashboardPage.goToDocuments();
  await documentsPage.searchDocument(uniqueTitle);

  // viewer should not see delete
  await documentsPage.expectNoDeleteButtonForDocument(documentId);
});