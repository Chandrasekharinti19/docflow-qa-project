import { Page, expect, Download } from "@playwright/test";
import path from "path";

export class DocumentsPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page.getByTestId("documents-page-title")).toBeVisible();
  }

  async createDocument(title: string, filePath: string) {
    await this.page.getByTestId("document-title-input").fill(title);
    await this.page
      .getByTestId("document-file-input")
      .setInputFiles(path.resolve(filePath));
    await this.page.getByTestId("upload-document-button").click();
  }

  async expectSuccessMessage() {
    await expect(this.page.getByTestId("document-success-message")).toBeVisible();
  }

  async expectErrorMessage(text?: string) {
    const locator = this.page.getByTestId("document-error-message");
    await expect(locator).toBeVisible();
    if (text) {
      await expect(locator).toContainText(text);
    }
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

  async expectDocumentNotVisible(title: string) {
    await expect(this.page.getByRole("cell", { name: title })).toHaveCount(0);
  }

  async expectReadOnlyMessage() {
    await expect(this.page.getByTestId("read-only-message")).toBeVisible();
  }

  async expectOpenLinkForDocument(id: number) {
    await expect(this.page.getByTestId(`open-document-${id}`)).toBeVisible();
  }

  async expectDeleteButtonForDocument(id: number) {
    await expect(this.page.getByTestId(`delete-document-${id}`)).toBeVisible();
  }

  async expectNoDeleteButtonForDocument(id: number) {
    await expect(this.page.getByTestId(`delete-document-${id}`)).toHaveCount(0);
  }

  async deleteDocumentById(id: number) {
    await this.page.getByTestId(`delete-document-${id}`).click();
  }

  async getDocumentIdByTitle(title: string) {
    const row = this.page.locator("tbody tr").filter({
      has: this.page.getByRole("cell", { name: title }),
    }).first();

    const idText = await row.locator("td").nth(0).textContent();
    return Number(idText);
  }

  async downloadDocumentById(id: number): Promise<Download> {
    const downloadPromise = this.page.waitForEvent("download");
    await this.page.getByTestId(`open-document-${id}`).click();
    return await downloadPromise;
  }
}