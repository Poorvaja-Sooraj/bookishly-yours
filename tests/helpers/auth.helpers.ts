import { test as base, type Page } from "@playwright/test";

/** Unique email generator scoped to the current test worker to avoid collisions. */
export function uniqueEmail(label: string): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `pw_${label}_${timestamp}_${rand}@test.local`;
}

/** Default test password used across auth tests. */
export const TEST_PASSWORD = "Playwright_Test!42";

/** Default test username prefix. */
export const TEST_USERNAME = "pw_tester";

/**
 * Signs up a new user via the API and returns the credentials.
 * This avoids UI-dependent setup and keeps tests isolated.
 */
export async function signupViaAPI(
  page: Page,
  overrides: { username?: string; email?: string; password?: string } = {}
) {
  const creds = {
    username: overrides.username ?? TEST_USERNAME,
    email: overrides.email ?? uniqueEmail("helper"),
    password: overrides.password ?? TEST_PASSWORD,
  };

  const response = await page.request.post("/api/auth/signup", {
    data: creds,
  });

  return { response, ...creds };
}

/**
 * Logs in a user via the API. The page's cookie jar receives the auth token.
 */
export async function loginViaAPI(
  page: Page,
  email: string,
  password: string = TEST_PASSWORD
) {
  const response = await page.request.post("/api/auth/login", {
    data: { email, password },
  });

  return response;
}

/**
 * Logs out via the API.
 */
export async function logoutViaAPI(page: Page) {
  return page.request.post("/api/auth/logout");
}

/**
 * Creates a new book via the API for test isolation.
 * Returns the created book JSON.
 */
export async function createBookViaAPI(
  page: Page,
  data: {
    title?: string;
    author?: string;
    genre?: string;
    totalPages?: number;
    coverImageUrl?: string;
  } = {}
) {
  const bookData = {
    title: data.title ?? `Test Book ${Date.now()}`,
    author: data.author ?? "Test Author",
    genre: data.genre ?? "Fiction",
    totalPages: data.totalPages ?? 300,
    coverImageUrl:
      data.coverImageUrl ?? "https://dummy.cdn/cover.jpg",
  };

  const response = await page.request.post("/api/books", {
    data: bookData,
  });
  const json = await response.json();
  return json.book;
}

/**
 * Mocks the /api/upload endpoint for image or audio uploads.
 * Should be called before actions that trigger an upload.
 */
export async function mockUpload(page: Page, fileType: "image" | "audio") {
  await page.route("**/api/upload", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        fileUrl: `https://dummy.cdn/${fileType}_placeholder.${fileType === "image" ? "jpg" : "mp3"}`,
      }),
    });
  });
}

/**
 * Simple helper to wait for the reading timer to reach at least the given seconds.
 */
export async function waitForTimer(page: Page, seconds: number) {
  // Wait a bit longer than the expected seconds to ensure the UI updates.
  await page.waitForTimeout(seconds * 1000 + 500);
  const timer = await page.getByTestId("reading-timer").innerText();
  // Optionally you could assert here, but callers can assert as needed.
  return timer;
}


/**
 * Extended test fixture that auto-dismisses `window.alert` dialogs
 * which the auth page uses for success/error feedback.
 */
export const test = base.extend<{ alertMessages: string[] }>({
  alertMessages: async ({ page }, use) => {
    const messages: string[] = [];
    page.on("dialog", async (dialog) => {
      messages.push(dialog.message());
      await dialog.accept();
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(messages);
  },
});

export { expect } from "@playwright/test";
