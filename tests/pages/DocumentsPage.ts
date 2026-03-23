import { Page, expect } from "@playwright/test";

export class DocumentsPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page.getByTestId("documents-page-title")).toBeVisible();
  }

  async createDocument(title: string, fileName: string) {
    await this.page.getByTestId("document-title-input").fill(title);
    await this.page.getByTestId("document-file-input").fill(fileName);
    await this.page.getByTestId("upload-document-button").click();
  }

  async expectSuccessMessage() {
    await expect(this.page.getByTestId("document-success-message")).toBeVisible();
  }

  async searchDocument(searchText: string) {
    await this.page.getByTestId("document-search-input").fill(searchText);
    await this.page.getByTestId("document-search-button").click();
  }

  async clearSearch() {
    await this.page.getByTestId("document-clear-search-button").click();
  }

  async openDocumentByTitle(title: string) {
    await this.page.getByRole("cell", { name: title }).click();
  }

  async expectDocumentVisible(title: string) {
    await expect(this.page.getByRole("cell", { name: title })).toBeVisible();
  }

  async expectReadOnlyMessage() {
    await expect(this.page.getByTestId("read-only-message")).toBeVisible();
  }
}