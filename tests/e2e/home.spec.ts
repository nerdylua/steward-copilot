import { expect, test } from "@playwright/test";

test("home page renders the workflow buttons", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Steward Copilot for governed metadata workflows.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Guided Workflow Presets")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Search customer PII/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Run workflow" }),
  ).toBeVisible();
});

test("schema inspection renders mocked MCP schema", async ({ page }) => {
  await page.route("**/api/workflows/write", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        result: {
          available: true,
          toolName: "create_test_case",
          schema: {
            type: "object",
            required: ["name"],
          },
        },
      }),
    });
  });

  await page.goto("/");
  await page
    .getByRole("button", { name: /Bonus Inspect extension schema/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Inspect extension schema" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Run workflow" }).click();

  const schemaPanel = page.locator("section").filter({
    hasText: "Schema for create_test_case",
  });

  await expect(schemaPanel).toBeVisible();
  await expect(schemaPanel.getByText('"required"')).toBeVisible();
});
