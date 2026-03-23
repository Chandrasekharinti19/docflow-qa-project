import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { DocumentsPage } from "../pages/DocumentsPage";
import { users } from "../utils/testData";

test("editor can create and search a document", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const documentsPage = new DocumentsPage(page);

  const uniqueTitle = `Playwright Document ${Date.now()}`;
  const fileName = `playwright-${Date.now()}.pdf`;

  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);

  await dashboardPage.expectLoaded();
  await dashboardPage.goToDocuments();

  await documentsPage.expectLoaded();
  await documentsPage.createDocument(uniqueTitle, fileName);
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