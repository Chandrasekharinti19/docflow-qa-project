import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { users } from "../utils/testData";

test("valid editor login loads dashboard", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.login(users.editor.email, users.editor.password);
  await dashboardPage.expectLoaded();
  await dashboardPage.expectRole("Editor");
});

test("invalid login shows error message", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login("wrong@test.com", "WrongPassword");
  await loginPage.expectLoginError("Invalid email or password");
});