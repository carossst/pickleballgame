const { test, expect } = require("@playwright/test");

const pages = [
  { path: "/", landing: "Start", lang: "en" },
  { path: "/fr.html", landing: "Commencer", lang: "fr" }
];

for (const spec of pages) {
  test(`${spec.lang} app boots and renders the landing screen`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error && error.message ? error.message : error)));

    const response = await page.goto(spec.path, { waitUntil: "domcontentloaded" });
    expect(response && response.ok()).toBeTruthy();
    await expect(page.locator("#app")).toContainText(spec.landing, { timeout: 15000 });
    await expect(page.locator("html")).toHaveAttribute("lang", spec.lang);
    expect(pageErrors).toEqual([]);
  });
}

test("language switch navigates to the French entry page", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#app")).toContainText("Start", { timeout: 15000 });
  const switcher = page.locator('[data-wt-locale-swap-to="fr"]');
  await expect(switcher).toBeVisible();
  await switcher.click();
  await expect(page).toHaveURL(/\/fr\.html(?:[?#].*)?$/);
  await expect(page.locator("#app")).toContainText("Commencer", { timeout: 15000 });
});

test("critical PWA assets are published", async ({ request }) => {
  for (const path of ["/app.bundle.js", "/style.css", "/content.json", "/sw.js", "/manifest.json", "/manifest.fr.json"]) {
    const response = await request.get(path);
    expect(response.ok(), path).toBeTruthy();
  }
});
