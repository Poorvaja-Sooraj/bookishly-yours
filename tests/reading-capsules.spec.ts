import { test, expect, type Page } from "@playwright/test";
import {
  signupViaAPI,
  loginViaAPI,
  createBookViaAPI,
  mockUpload,
} from "./helpers/auth.helpers.js";

/** Helper to open a book's details modal */
async function openBookDetails(page: Page, book: { title: string }) {
  await page.goto("/dashboard/all-books");
  await page.waitForURL("**/dashboard/all-books**");
  const bookLocator = page.locator(`h3[title="${book.title}"]`);
  await bookLocator.waitFor({ state: "visible", timeout: 10000 });
  await bookLocator.click();
}

/**
 * Inject a full mock of navigator.mediaDevices.getUserMedia and MediaRecorder
 * into the browser context via page.evaluate. This must be called BEFORE the
 * voice modal is opened.
 *
 * The mock mirrors exactly what AddVoiceModal.tsx consumes:
 *   - getUserMedia({ audio: true }) -> MediaStream with getTracks() -> [{ stop() }]
 *   - new MediaRecorder(stream)
 *       .start()
 *       .stop() -> fires ondataavailable({ data: Blob }) then onstop()
 *       .ondataavailable / .onstop event handlers
 */
async function injectMediaMocks(page: Page) {
  await page.evaluate(() => {
    // --- Mock MediaStream with stoppable tracks ---
    const mockTrack = { stop: () => {}, kind: "audio", enabled: true };
    const mockStream = { getTracks: () => [mockTrack] };

    // Override getUserMedia
    if (!navigator.mediaDevices) {
      Object.defineProperty(navigator, "mediaDevices", {
        value: {},
        writable: true,
        configurable: true,
      });
    }
    navigator.mediaDevices.getUserMedia = () =>
      Promise.resolve(mockStream as unknown as MediaStream);

    // --- Mock MediaRecorder ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).MediaRecorder = class MockMediaRecorder {
      stream: unknown;
      ondataavailable: ((e: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      state: string = "inactive";

      constructor(stream: unknown) {
        this.stream = stream;
      }

      start() {
        this.state = "recording";
      }

      stop() {
        this.state = "inactive";
        // Fire ondataavailable asynchronously, then onstop — matches real browser
        // behavior. AddVoiceModal checks event.data.size > 0 and pushes to
        // audioChunksRef, then in onstop creates the final Blob from those chunks.
        setTimeout(() => {
          if (this.ondataavailable) {
            const chunk = new Blob(["mock-audio-data"], {
              type: "audio/webm",
            });
            this.ondataavailable({ data: chunk });
          }
          // onstop fires after ondataavailable so audioChunksRef is populated
          setTimeout(() => {
            if (this.onstop) this.onstop();
          }, 10);
        }, 10);
      }
    };
  });
}

test.describe("Reading Journey & Memories/Capsules", () => {
  test("full reading flow with timer, pause/resume, save session, and capsule actions", async ({
    page,
  }) => {
    // Increase timeout for this long integration test
    test.setTimeout(60_000);

    // ── Auth setup ──
    const { email, password } = await signupViaAPI(page);
    await loginViaAPI(page, email, password);

    // ── Create an isolated test book via API ──
    const book = await createBookViaAPI(page, {
      title: "Test Journey Book",
      author: "Journey Author",
      genre: "Adventure",
      totalPages: 200,
    });

    // ── Open the book details modal ──
    await openBookDetails(page, book);

    // ---------- Start Reading: page picker -> timer ----------
    // Click "Start Reading" on the BookDetailsModal
    await page.getByRole("button", { name: /Start Reading/i }).click();

    // The StartReadingModal shows the start-page picker first, then "▶ Start Reading"
    await page.getByRole("button", { name: /▶ Start Reading/i }).click();

    // Wait for the timer UI to appear
    await expect(page.getByText("Reading Time")).toBeVisible({ timeout: 5000 });

    // ---------- Timer: pause / verify / resume ----------
    await page.waitForTimeout(3000);

    // Pause
    await page.getByRole("button", { name: /Pause/i }).click();

    // Verify the timer is actually paused (value unchanged over 2s)
    const timerBefore = await page.locator("div.font-mono").innerText();
    await page.waitForTimeout(2000);
    const timerAfter = await page.locator("div.font-mono").innerText();
    expect(timerBefore).toBe(timerAfter);

    // Resume
    await page.getByRole("button", { name: /Resume/i }).click();
    await page.waitForTimeout(2000);

    // ---------- Text Capsule ----------
    await page.getByRole("button", { name: /Add Capsule/i }).click();
    await page.getByRole("button", { name: /Add Card/i }).click();
    await page.getByPlaceholder(/Write something.../).fill("My First Thought");
    await page.getByRole("button", { name: /Save Card/i }).click();
    // Capsule saved → modal closes → timer screen is back
    await expect(page.getByText("Reading Time")).toBeVisible({ timeout: 5000 });

    // ---------- Voice Capsule ----------
    // 1. Mock the /api/upload endpoint so the audio upload succeeds
    await mockUpload(page, "audio");

    // 2. Inject MediaRecorder + getUserMedia mocks into the current page context
    await injectMediaMocks(page);

    // 3. Open the capsule chooser and pick "Add Voice"
    await page.getByRole("button", { name: /Add Capsule/i }).click();
    await page.getByRole("button", { name: /Add Voice/i }).click();

    // 4. The AddVoiceModal should be visible with the mic button
    const micButton = page.locator('button[title="Start Recording"]');
    await expect(micButton).toBeVisible({ timeout: 5000 });

    // 5. Click to start recording
    await micButton.click();

    // 6. The button title should change to "Stop Recording"
    const stopButton = page.locator('button[title="Stop Recording"]');
    await expect(stopButton).toBeVisible({ timeout: 5000 });

    // 7. Click to stop recording — triggers mock's async ondataavailable -> onstop
    await stopButton.click();

    // 8. Wait for Save Recording button to become enabled (audioBlob !== null)
    const saveBtn = page.getByRole("button", { name: /Save Recording/i });
    await expect(saveBtn).toBeEnabled({ timeout: 5000 });

    // 9. Mock the capsules API so saving succeeds
    await page.route("**/api/books/*/capsules", async (route, request) => {
      if (request.method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Capsule item added successfully",
            capsule: {
              id: "mock-voice-capsule-id",
              type: "voice",
              audioUrl: "https://dummy.cdn/audio_placeholder.mp3",
              audioDuration: 3,
              createdAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // 10. Save the voice recording
    await saveBtn.click();

    // The modal should close and we return to the timer view
    await expect(page.getByText("Reading Time")).toBeVisible({ timeout: 5000 });

    // Clear the capsules API mock so subsequent requests go to the real server
    await page.unroute("**/api/books/*/capsules");

    // ---------- Stop and Save Session ----------
    await page.getByRole("button", { name: /Stop/i }).click();

    // The end-page step should show "Great session!" and "Save Session"
    await expect(page.getByText("Great session!")).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole("button", { name: /Save Session/i }).click();

    // After saving, we should navigate back to the dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});
