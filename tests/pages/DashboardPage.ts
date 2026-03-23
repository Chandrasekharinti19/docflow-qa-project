import { Page, expect } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page.getByTestId("dashboard-title")).toBeVisible();
  }

  async expectRole(role: string) {
    await expect(this.page.getByTestId("user-role")).toContainText(role);
  }

  async goToDocuments() {
    await this.page.getByTestId("go-documents-button").click();
  }

  async logout() {
    await this.page.getByTestId("logout-button").click();
  }
}