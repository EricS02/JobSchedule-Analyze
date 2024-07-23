import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("localhost:3000");
  await page.getByPlaceholder("id@example.com").click();
  await page.getByPlaceholder("id@example.com").fill("admin@example.com");
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL("http://localhost:3000/dashboard");
});

test.describe("Profile page", () => {
  const resumeTitle = "Test Resume 1";
  const editedTitle = "Test Resume 1 edited";
  test("should create a new resume", async ({ page }) => {
    await page.getByRole("link", { name: "Profile" }).click();

    await page.getByRole("button", { name: "Create Resume" }).click();
    await page.getByPlaceholder("Ex: Full Stack Developer").fill(resumeTitle);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("status")).toHaveText(
      /Resume title has been created/
    );
    await expect(page.locator("tbody")).toContainText(resumeTitle);
  });

  test("should edit the resume title", async ({ page }) => {
    await page.getByRole("link", { name: "Profile" }).click();
    await page.getByTestId("resume-actions-menu-btn").first().click();
    await page.getByRole("menuitem", { name: "Edit Resume Title" }).click();
    await page.getByPlaceholder("Ex: Full Stack Developer").fill(editedTitle);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("status")).toHaveText(
      /Resume title has been updated/
    );
    await expect(page.locator("tbody")).toContainText(editedTitle);
  });
  test("should add resume contact info", async ({ page }) => {
    await page.getByRole("link", { name: "Profile" }).click();
    await page
      .getByRole("row", { name: editedTitle })
      .getByTestId("resume-actions-menu-btn")
      .click();
    await page.getByRole("link", { name: "View/Edit Resume" }).click();
    await expect(page.getByRole("heading", { name: "Resume" })).toBeVisible();
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByRole("menuitem", { name: "Add Contact Info" }).click();
    await page.getByLabel("First Name").fill("John");
    await page.getByLabel("First Name").press("Tab");
    await page.getByLabel("Last Name").fill("Doe");
    await page.getByLabel("Last Name").press("Tab");
    await page
      .getByLabel("Headline")
      .fill("Skill developer with testing skills");
    await page.getByLabel("Headline").press("Tab");
    await page.getByLabel("Email").fill("admin@example.com");
    await page.getByLabel("Email").press("Tab");
    await page.getByLabel("Phone").fill("123456789");
    await page.getByLabel("Phone").press("Tab");
    await page.getByLabel("Address").fill("Calgary");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("status").first()).toContainText(
      /Contact Info has been created/
    );
    await expect(page.getByRole("heading", { name: "John Doe" })).toBeVisible();
  });

  test("should add resume summary section", async ({ page }) => {
    await page.getByRole("link", { name: "Profile" }).click();
    await page
      .getByRole("row", { name: editedTitle })
      .getByTestId("resume-actions-menu-btn")
      .click();
    await page.getByRole("link", { name: "View/Edit Resume" }).click();
    await expect(page.getByRole("heading", { name: "Resume" })).toBeVisible();
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByRole("menuitem", { name: "Add Summary" }).click();
    await page.getByLabel("Section Title").fill("Summary");
    await page.locator(".tiptap").click();
    await page.locator(".tiptap").fill("this is test summary\n");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("heading", { name: "Summary" })).toBeVisible();
    await expect(page.getByText("this is test summary")).toBeVisible();
    await expect(page.getByRole("status").first()).toContainText(
      /Summary has been created/
    );
  });

  test("should add resume work experience section", async ({ page }) => {
    const jobText = "Software Developer";
    await page.getByRole("link", { name: "Profile" }).click();
    await page
      .getByRole("row", { name: editedTitle })
      .getByTestId("resume-actions-menu-btn")
      .click();
    await page.getByRole("link", { name: "View/Edit Resume" }).click();
    await expect(page.getByRole("heading", { name: "Resume" })).toBeVisible();
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByRole("menuitem", { name: "Add Experience" }).click();
    await page.getByPlaceholder("Ex: Experience").fill("Experience");
    await page.getByPlaceholder("Ex: Experience").press("Tab");
    await page.getByLabel("Job Title").click();
    await page.getByPlaceholder("Create or Search title").click();
    await page.getByPlaceholder("Create or Search title").fill(jobText);
    const jobTitle = page.getByRole("option", {
      name: jobText,
      exact: true,
    });
    if (await jobTitle.isVisible()) {
      await jobTitle.click();
    } else {
      await page.getByText(jobText).click();
    }
    await expect(page.getByLabel("Job Title")).toContainText(jobText);
    await page.getByLabel("Company").click();
    await page.getByPlaceholder("Create or Search company").click();
    const companyText = "company test";
    await page.getByPlaceholder("Create or Search company").fill(companyText);
    const companyTitle = page.getByRole("option", {
      name: companyText,
      exact: true,
    });
    if (await companyTitle.isVisible()) {
      await companyTitle.click();
    } else {
      await page.getByText(companyText).click();
    }
    await expect(page.getByLabel("Company")).toContainText(companyText);
    await page.getByLabel("Job Location").click();
    await page.getByPlaceholder("Create or Search location").click();
    const locationText = "location test";
    await page.getByPlaceholder("Create or Search location").fill(locationText);
    const locationTitle = page.getByRole("option", {
      name: locationText,
      exact: true,
    });
    if (await locationTitle.isVisible()) {
      await locationTitle.click();
    } else {
      await page.getByText(locationText).click();
    }
    await expect(page.getByLabel("Job Location")).toContainText(locationText);
    await page.getByLabel("Start Date").click();
    await page
      .getByRole("gridcell", { name: "2", exact: true })
      .first()
      .click();
    await page.locator("div:nth-child(2) > .tiptap").click();
    await page.locator("div:nth-child(2) > .tiptap").fill("test description");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("status").first()).toContainText(
      /Experience has been added/
    );
    await expect(page.getByRole("heading", { name: jobText })).toBeVisible();
  });

  test("should add resume education section", async ({ page }) => {
    const degreeText = "Bachelor of Science";
    await page.getByRole("link", { name: "Profile" }).click();
    await page
      .getByRole("row", { name: editedTitle })
      .getByTestId("resume-actions-menu-btn")
      .click();
    await page.getByRole("link", { name: "View/Edit Resume" }).click();
    await expect(page.getByRole("heading", { name: "Resume" })).toBeVisible();
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByRole("menuitem", { name: "Add Education" }).click();
    await page.getByPlaceholder("Ex: Education").fill("Education");
    await page.getByPlaceholder("Ex: Stanford").click();
    await page.getByPlaceholder("Ex: Stanford").fill("test school");
    await page.getByLabel("Location").click();
    await page.getByPlaceholder("Create or Search location").click();
    const locationText = "location test";
    await page.getByPlaceholder("Create or Search location").fill(locationText);
    const locationTitle = page.getByRole("option", {
      name: locationText,
      exact: true,
    });
    if (await locationTitle.isVisible()) {
      await locationTitle.click();
    } else {
      await page.getByText(locationText).click();
    }
    await expect(page.getByLabel("Location")).toContainText(locationText);
    await page.getByPlaceholder("Ex: Bachelor's").click();
    await page.getByPlaceholder("Ex: Bachelor's").fill("degree text");
    await page.getByPlaceholder("Ex: Computer Science").click();
    await page
      .getByPlaceholder("Ex: Computer Science")
      .fill("computer science");
    await page.getByLabel("Start Date").click();
    await page
      .getByRole("gridcell", { name: "2", exact: true })
      .first()
      .click();
    await page.getByLabel("End Date").click();
    await page
      .getByRole("gridcell", { name: "3", exact: true })
      .first()
      .click();
    await page.locator("div:nth-child(2) > .tiptap").click();
    await page.locator("div:nth-child(2) > .tiptap").fill("test description");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("status").first()).toContainText(
      /Education has been added/
    );
    await expect(
      page.getByRole("heading", { name: "test school" })
    ).toBeVisible();
  });

  test("should delete a resume", async ({ page }) => {
    await page.getByRole("link", { name: "Profile" }).click();
    await page.getByTestId("resume-actions-menu-btn").first().click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await expect(page.getByRole("alertdialog")).toContainText(
      "Are you sure you want to delete this resume?"
    );
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("status").first()).toContainText(
      /Resume has been deleted successfully/
    );
    await expect(page.locator("tbody")).not.toContainText(editedTitle);
  });
});
