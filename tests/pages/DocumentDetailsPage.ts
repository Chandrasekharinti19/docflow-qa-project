import { Page, expect } from "@playwright/test";

export class DocumentDetailsPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page.getByTestId("document-details-title")).toBeVisible();
  }

  async assignReviewer(reviewerEmail: string) {
    await this.page.getByTestId("reviewer-select").selectOption(reviewerEmail);
    await this.page.getByTestId("assign-reviewer-button").click();
  }

  async approveDocument() {
    await this.page.getByTestId("approve-document-button").click();
    await expect(this.page.getByTestId("document-details-success")).toBeVisible();
  }

  async rejectDocument(notes: string) {
    await this.page.getByTestId("reject-notes-input").fill(notes);
    await this.page.getByTestId("reject-document-button").click();
  }

  async expectStatus(status: string) {
    await expect(this.page.getByTestId("document-status")).toContainText(status);
  }

  async expectReviewer(email: string) {
    await expect(this.page.getByTestId("document-reviewer")).toContainText(email);
  }

  async expectAuditAction(action: string) {
    await expect(
      this.page.getByTestId("audit-history-list").getByText(`Action: ${action}`)
    ).toBeVisible();
  }

  async goBackToDocuments() {
    await this.page.getByTestId("back-documents-button").click();
  }
}