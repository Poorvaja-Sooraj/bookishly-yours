import {
  test,
  expect,
  uniqueEmail,
  TEST_PASSWORD,
  TEST_USERNAME,
  signupViaAPI,
  loginViaAPI,
  logoutViaAPI,
} from "./helpers/auth.helpers.js";

test.describe("Signup", () => {
  test("should sign up a new user via the UI and redirect to dashboard", async ({
    page,
    alertMessages,
  }) => {
    const email = uniqueEmail("signup_ui");

    await page.goto("/auth");

    // Switch to signup tab
    await page.getByRole("button", { name: "Sign Up", exact: true }).click();

    // Fill in signup fields
    await page.getByPlaceholder("Create username").fill(TEST_USERNAME);
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(TEST_PASSWORD);

    // Submit
    await page.getByRole("button", { name: "Create Account" }).click();

    // Wait for the redirect to /dashboard
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    expect(page.url()).toContain("/dashboard");
    expect(alertMessages).toContain("Account created successfully!");
  });

  test("should reject duplicate email signup", async ({
    page,
    alertMessages,
  }) => {
    // Create user via API first
    const { email } = await signupViaAPI(page);

    // Clear auth state so we can try signing up again via UI
    await logoutViaAPI(page);

    await page.goto("/auth");
    await page.getByRole("button", { name: "Sign Up", exact: true }).click();

    await page.getByPlaceholder("Create username").fill("duplicate_user");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(TEST_PASSWORD);

    await page.getByRole("button", { name: "Create Account" }).click();

    // The app shows an alert with the error message
    await page.waitForTimeout(3000);
    expect(alertMessages).toContain("User already exists with this email.");
  });
});

test.describe("Login", () => {
  test("should log in with valid credentials and redirect to dashboard", async ({
    page,
    alertMessages,
  }) => {
    // Create a test user via API, then log out to test login flow
    const { email } = await signupViaAPI(page);
    await logoutViaAPI(page);

    await page.goto("/auth");

    // Login tab should be active by default
    await page.getByPlaceholder("Email address").fill(email);
    await page.getByPlaceholder("Password").fill(TEST_PASSWORD);

    await page.locator("form").getByRole("button", { name: "Login" }).click();

    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    expect(page.url()).toContain("/dashboard");
    expect(alertMessages).toContain("Login successful!");
  });

  test("should reject login with wrong password", async ({
    page,
    alertMessages,
  }) => {
    const { email } = await signupViaAPI(page);
    await logoutViaAPI(page);

    await page.goto("/auth");

    await page.getByPlaceholder("Email address").fill(email);
    await page.getByPlaceholder("Password").fill("WrongPassword123!");

    await page.locator("form").getByRole("button", { name: "Login" }).click();

    await page.waitForTimeout(3000);
    expect(alertMessages).toContain("Invalid email or password.");
  });

  test("should reject login with non-existent email", async ({
    page,
    alertMessages,
  }) => {
    await page.goto("/auth");

    await page
      .getByPlaceholder("Email address")
      .fill("nobody_exists@test.local");
    await page.getByPlaceholder("Password").fill(TEST_PASSWORD);

    await page.locator("form").getByRole("button", { name: "Login" }).click();

    await page.waitForTimeout(3000);
    expect(alertMessages).toContain("Invalid email or password.");
  });
});

test.describe("Logout", () => {
  test("should log out from the dashboard and redirect to auth page", async ({
    page,
  }) => {
    // Sign up and land on dashboard
    const { email } = await signupViaAPI(page);
    await loginViaAPI(page, email);

    await page.goto("/dashboard");
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Click the logout button in the sidebar (desktop view)
    await page.setViewportSize({ width: 1280, height: 720 });
    const logoutButton = page.getByRole("button", { name: "Logout" });
    await logoutButton.click();

    // Should redirect to /auth
    await page.waitForURL("**/auth**", { timeout: 15000 });
    expect(page.url()).toContain("/auth");
  });
});

test.describe("Protected Routes", () => {
  test("should be able to access dashboard when authenticated", async ({
    page,
  }) => {
    const { email } = await signupViaAPI(page);
    await loginViaAPI(page, email);

    await page.goto("/dashboard");

    // Should stay on dashboard (not be redirected)
    // The dashboard layout renders the sidebar with navigation
    await expect(
      page.getByRole("link", { name: "Dashboard" })
    ).toBeVisible({ timeout: 15000 });
  });

  test("should return 401 for protected API routes without auth", async ({
    page,
  }) => {
    // Try hitting a protected API route without authentication
    const response = await page.request.get("/api/books");
    expect(response.status()).toBe(401);
  });
});

test.describe("Authentication Persistence", () => {
  test("should maintain auth state across page reloads", async ({ page }) => {
    const { email } = await signupViaAPI(page);
    await loginViaAPI(page, email);

    // Navigate to dashboard
    await page.goto("/dashboard");
    await expect(
      page.getByRole("link", { name: "Dashboard" })
    ).toBeVisible({ timeout: 15000 });

    // Reload the page
    await page.reload();

    // Should still be on dashboard, not redirected to auth
    await expect(
      page.getByRole("link", { name: "Dashboard" })
    ).toBeVisible({ timeout: 15000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("should maintain auth state when navigating between dashboard pages", async ({
    page,
  }) => {
    const { email } = await signupViaAPI(page);
    await loginViaAPI(page, email);

    await page.goto("/dashboard");
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate to "All Books" via sidebar
    await page.getByRole("link", { name: "All Books" }).click();
    await page.waitForURL("**/dashboard/all-books**", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard/all-books");

    // Navigate back to Dashboard
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("should lose auth state after logout", async ({ page }) => {
    const { email } = await signupViaAPI(page);
    await loginViaAPI(page, email);

    // Verify we're authenticated
    await page.goto("/dashboard");
    await expect(
      page.getByRole("link", { name: "Dashboard" })
    ).toBeVisible({ timeout: 15000 });

    // Logout via API
    await logoutViaAPI(page);

    // Try to access a protected API route — should be unauthorized
    const response = await page.request.get("/api/books");
    expect(response.status()).toBe(401);
  });
});
