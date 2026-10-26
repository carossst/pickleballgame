const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const pages = [
  { path: '/', name: 'English home' },
  { path: '/fr.html', name: 'French home' },
  { path: '/poster', name: 'Printable poster' }
];

for (const spec of pages) {
  test(`${spec.name} has no serious accessibility violations`, async ({ page }) => {
    const response = await page.goto(spec.path, {
      waitUntil: 'domcontentloaded'
    });
    expect(response && response.ok()).toBeTruthy();

    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact)
    );

    expect(seriousViolations).toEqual([]);
  });
}
