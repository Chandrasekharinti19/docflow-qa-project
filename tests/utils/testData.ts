export const users = {
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@test.com",
    password: process.env.USER_PASSWORD || "Password123",
  },
  editor: {
    email: process.env.EDITOR_EMAIL || "editor@test.com",
    password: process.env.USER_PASSWORD || "Password123",
  },
  reviewer: {
    email: process.env.REVIEWER_EMAIL || "reviewer@test.com",
    password: process.env.USER_PASSWORD || "Password123",
  },
  viewer: {
    email: process.env.VIEWER_EMAIL || "viewer@test.com",
    password: process.env.USER_PASSWORD || "Password123",
  },
};

export const documents = {
  sampleTitle: "Playwright Test Document",
  sampleFileName: "playwright-test-doc.pdf",
};