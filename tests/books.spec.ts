import {
  test,
  expect,
  signupViaAPI,
} from "./helpers/auth.helpers.js";

test.describe("Books Features", () => {
  // Before each test, we sign up a fresh user which logs them in and isolates their book shelf.
  test.beforeEach(async ({ page }) => {
    await signupViaAPI(page);
  });

  test("should load the dashboard with empty stats initially", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Total Books", { exact: true })).toBeVisible();
    
    // Check that stats initially show 0 (scoped to StatsCards section via grid class)
    const statsCards = page.locator("section.grid");
    await expect(statsCards.locator("p:has-text('Total Books') + p")).toHaveText("0");
    await expect(statsCards.locator("p:has-text('Completed Books') + p")).toHaveText("0");
    await expect(statsCards.locator("p:has-text('Currently Reading') + p")).toHaveText("0");
    await expect(statsCards.locator("p:has-text('Want to Read') + p")).toHaveText("0");
  });

  test("should add a new book successfully", async ({ page }) => {
    await page.goto("/dashboard/all-books");
    await page.getByRole("button", { name: "Add Book" }).first().click();

    // Fill in book details
    await page.getByPlaceholder("Enter book name").fill("Test Book");
    await page.getByPlaceholder("Enter author name").fill("Test Author");
    await page.getByRole("combobox").first().selectOption("Currently Reading");
    await page.getByRole("combobox").nth(1).selectOption("Sci-Fi");
    await page.getByPlaceholder("Enter total pages").fill("300");
    await page.getByPlaceholder("Enter current page").fill("10");

    // Click submit
    await page.locator("form button[type='submit']").click();

    // Verify it was added and details are correct on the card
    await expect(page.locator("h3[title='Test Book']")).toBeVisible();
    await expect(page.locator("p[title='Test Author']")).toBeVisible();
  });

  test("should handle cover image upload with mock", async ({ page }) => {
    // Intercept upload endpoint and mock response to prevent dependency on Cloudinary credentials
    await page.route("/api/upload", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          imageUrl: "https://res.cloudinary.com/dummy-cloud/image/upload/v12345/bookishly-yours/books/test_cover.jpg",
        }),
      });
    });

    await page.goto("/dashboard/all-books");
    await page.getByRole("button", { name: "Add Book" }).first().click();

    await page.getByPlaceholder("Enter book name").fill("Book with Cover");
    await page.getByPlaceholder("Enter author name").fill("Cover Author");
    await page.getByRole("combobox").first().selectOption("Completed");
    await page.getByRole("combobox").nth(1).selectOption("Fantasy");
    await page.getByPlaceholder("Enter total pages").fill("250");

    // Upload cover image
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator("text=Upload Cover").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "cover.png",
      mimeType: "image/png",
      buffer: Buffer.from("dummy-image-data"),
    });

    // Check if the preview image displays with mock URL
    await page.locator("form button[type='submit']").click();

    // Locate the newly added card
    await expect(page.locator("h3[title='Book with Cover']")).toBeVisible();
    
    // Check that the image source is our mocked URL
    const img = page.locator("img[alt='Book with Cover']");
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("src", /test_cover/);
  });

  test("should edit an existing book successfully", async ({ page }) => {
    // Add book via UI first
    await page.goto("/dashboard/all-books");
    await page.getByRole("button", { name: "Add Book" }).first().click();
    await page.getByPlaceholder("Enter book name").fill("Original Title");
    await page.getByPlaceholder("Enter author name").fill("Original Author");
    await page.getByRole("combobox").first().selectOption("Want to Read");
    await page.getByRole("combobox").nth(1).selectOption("Fiction");
    await page.getByPlaceholder("Enter total pages").fill("400");
    await page.locator("form button[type='submit']").click();

    await expect(page.locator("h3[title='Original Title']")).toBeVisible();

    // Edit the book
    await page.getByRole("button", { name: "Options for Original Title" }).click();
    await page.getByRole("button", { name: "Edit Book" }).click();

    // Verify dialog title
    await expect(page.locator("#add-book-modal-title")).toHaveText("Edit Book");

    // Change title and author
    await page.getByPlaceholder("Enter book name").fill("Updated Title");
    await page.getByPlaceholder("Enter author name").fill("Updated Author");
    await page.locator("form button[type='submit']").click();

    // Verify changes are updated
    await expect(page.locator("h3[title='Updated Title']")).toBeVisible();
    await expect(page.locator("p[title='Updated Author']")).toBeVisible();
    await expect(page.locator("h3[title='Original Title']")).not.toBeVisible();
  });

  test("should delete a book successfully via dropdown", async ({ page }) => {
    await page.goto("/dashboard/all-books");
    await page.getByRole("button", { name: "Add Book" }).first().click();
    await page.getByPlaceholder("Enter book name").fill("To Be Deleted");
    await page.getByPlaceholder("Enter author name").fill("Temp Author");
    await page.getByRole("combobox").first().selectOption("Want to Read");
    await page.getByRole("combobox").nth(1).selectOption("Fiction");
    await page.getByPlaceholder("Enter total pages").fill("150");
    await page.locator("form button[type='submit']").click();

    await expect(page.locator("h3[title='To Be Deleted']")).toBeVisible();

    // Delete via options menu
    await page.getByRole("button", { name: "Options for To Be Deleted" }).click();
    await page.getByRole("button", { name: "Delete Book" }).click();

    // Verify it is removed
    await expect(page.locator("h3[title='To Be Deleted']")).not.toBeVisible();
  });

  test("should delete a book successfully via details modal", async ({ page }) => {
    await page.goto("/dashboard/all-books");
    await page.getByRole("button", { name: "Add Book" }).first().click();
    await page.getByPlaceholder("Enter book name").fill("Delete From Details");
    await page.getByPlaceholder("Enter author name").fill("Temp Author");
    await page.getByRole("combobox").first().selectOption("Want to Read");
    await page.getByRole("combobox").nth(1).selectOption("Fiction");
    await page.getByPlaceholder("Enter total pages").fill("150");
    await page.locator("form button[type='submit']").click();

    await page.locator("h3[title='Delete From Details']").click();

    // Details modal should open
    await expect(page.locator("h2:has-text('Delete From Details')")).toBeVisible();

    // Click remove from shelf
    await page.getByRole("button", { name: "Remove from Shelf" }).click();

    // Verify modal closed and book is removed
    await expect(page.locator("h2:has-text('Delete From Details')")).not.toBeVisible();
    await expect(page.locator("h3[title='Delete From Details']")).not.toBeVisible();
  });

  test("should search books dynamically by book name, author, or genre", async ({ page }) => {
    await page.goto("/dashboard/all-books");

    // Add Book 1: Title "Lord of the Rings", Author "J.R.R. Tolkien", Genre "Fantasy"
    await page.getByRole("button", { name: "Add Book" }).first().click();
    await page.getByPlaceholder("Enter book name").fill("Lord of the Rings");
    await page.getByPlaceholder("Enter author name").fill("J.R.R. Tolkien");
    await page.getByRole("combobox").first().selectOption("Currently Reading");
    await page.getByRole("combobox").nth(1).selectOption("Fantasy");
    await page.getByPlaceholder("Enter total pages").fill("1200");
    await page.locator("form button[type='submit']").click();

    // Add Book 2: Title "Sherlock Holmes", Author "Arthur Conan Doyle", Genre "Mystery"
    await page.getByRole("button", { name: "Add Book" }).first().click();
    await page.getByPlaceholder("Enter book name").fill("Sherlock Holmes");
    await page.getByPlaceholder("Enter author name").fill("Arthur Conan Doyle");
    await page.getByRole("combobox").first().selectOption("Completed");
    await page.getByRole("combobox").nth(1).selectOption("Mystery");
    await page.getByPlaceholder("Enter total pages").fill("500");
    await page.locator("form button[type='submit']").click();

    // Verify both are visible
    await expect(page.locator("h3[title='Lord of the Rings']")).toBeVisible();
    await expect(page.locator("h3[title='Sherlock Holmes']")).toBeVisible();

    const searchInput = page.getByPlaceholder("Search books, authors, or genres...");

    // 1. Search by title
    await searchInput.fill("Rings");
    await expect(page.locator("h3[title='Lord of the Rings']")).toBeVisible();
    await expect(page.locator("h3[title='Sherlock Holmes']")).not.toBeVisible();

    // 2. Search by author
    await searchInput.fill("Doyle");
    await expect(page.locator("h3[title='Sherlock Holmes']")).toBeVisible();
    await expect(page.locator("h3[title='Lord of the Rings']")).not.toBeVisible();

    // 3. Search by genre
    await searchInput.fill("Fantasy");
    await expect(page.locator("h3[title='Lord of the Rings']")).toBeVisible();
    await expect(page.locator("h3[title='Sherlock Holmes']")).not.toBeVisible();

    // 4. Non-matching search
    await searchInput.fill("NonExistentBook");
    await expect(page.locator("h3[title='Lord of the Rings']")).not.toBeVisible();
    await expect(page.locator("h3[title='Sherlock Holmes']")).not.toBeVisible();
    await expect(page.locator("text=No books found matching")).toBeVisible();
  });

  test("should categorize and show books in Currently Reading, Completed, and Want to Read sections", async ({ page }) => {
    // Add Currently Reading book
    await page.goto("/dashboard/all-books");
    await page.getByRole("button", { name: "Add Book" }).first().click();
    await page.getByPlaceholder("Enter book name").fill("Active Book");
    await page.getByPlaceholder("Enter author name").fill("Active Author");
    await page.getByRole("combobox").first().selectOption("Currently Reading");
    await page.getByRole("combobox").nth(1).selectOption("Biography");
    await page.getByPlaceholder("Enter total pages").fill("350");
    await page.locator("form button[type='submit']").click();

    // Add Completed book
    await page.getByRole("button", { name: "Add Book" }).first().click();
    await page.getByPlaceholder("Enter book name").fill("Finished Book");
    await page.getByPlaceholder("Enter author name").fill("Finished Author");
    await page.getByRole("combobox").first().selectOption("Completed");
    await page.getByRole("combobox").nth(1).selectOption("Self-Help");
    await page.getByPlaceholder("Enter total pages").fill("200");
    await page.locator("form button[type='submit']").click();

    // Add Want to Read book
    await page.getByRole("button", { name: "Add Book" }).first().click();
    await page.getByPlaceholder("Enter book name").fill("Future Book");
    await page.getByPlaceholder("Enter author name").fill("Future Author");
    await page.getByRole("combobox").first().selectOption("Want to Read");
    await page.getByRole("combobox").nth(1).selectOption("Romance");
    await page.getByPlaceholder("Enter total pages").fill("450");
    await page.locator("form button[type='submit']").click();

    // 1. Go to Currently Reading page
    await page.goto("/dashboard/currently-reading");
    await expect(page.locator("h3[title='Active Book']")).toBeVisible();
    await expect(page.locator("h3[title='Finished Book']")).not.toBeVisible();
    await expect(page.locator("h3[title='Future Book']")).not.toBeVisible();

    // 2. Go to Completed page
    await page.goto("/dashboard/completed");
    await expect(page.locator("h3[title='Finished Book']")).toBeVisible();
    await expect(page.locator("h3[title='Active Book']")).not.toBeVisible();
    await expect(page.locator("h3[title='Future Book']")).not.toBeVisible();

    // 3. Go to Want to Read page
    await page.goto("/dashboard/want-to-read");
    await expect(page.locator("h3[title='Future Book']")).toBeVisible();
    await expect(page.locator("h3[title='Active Book']")).not.toBeVisible();
    await expect(page.locator("h3[title='Finished Book']")).not.toBeVisible();

    // 4. Verify Stats Cards on Dashboard reflects them
    await page.goto("/dashboard");
    const statsCards = page.locator("section.grid");
    await expect(statsCards.locator("p:has-text('Total Books') + p")).toHaveText("3");
    await expect(statsCards.locator("p:has-text('Completed Books') + p")).toHaveText("1");
    await expect(statsCards.locator("p:has-text('Currently Reading') + p")).toHaveText("1");
    await expect(statsCards.locator("p:has-text('Want to Read') + p")).toHaveText("1");
  });
});
