const { test, expect } = require('@playwright/test');

async function startFreshRun(page, path = '/') {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toContainText(
    path === '/fr.html' ? 'Commencer' : 'Start',
    { timeout: 15000 }
  );

  await page.getByRole('button', {
    name: path === '/fr.html' ? 'Commencer' : 'Start',
    exact: true
  }).click();

  const modalStart = page.locator('[data-action="start-run"]');
  if (await modalStart.isVisible().catch(() => false)) {
    await modalStart.click();
  }

  await expect(page.locator('[data-action="answer-true"]')).toBeVisible({
    timeout: 15000
  });
}

test('RUN shows feedback, explanation, and a reliable next action', async ({
  page
}) => {
  await startFreshRun(page);

  await page.locator('[data-action="answer-true"]').click();
  await expect(page.locator('.wt-feedback')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.wt-explanation')).toBeVisible();
  await expect(page.locator('[data-action="continue"]')).toBeVisible();

  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="answer-true"]')).toBeVisible({
    timeout: 10000
  });
});

test('French RUN keeps the same answer and feedback contract', async ({
  page
}) => {
  await startFreshRun(page, '/fr.html');

  await page.locator('[data-action="answer-false"]').click();
  await expect(page.locator('.wt-feedback')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('[data-action="continue"]')).toBeVisible();
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="answer-false"]')).toBeVisible({
    timeout: 10000
  });
});

test('success page creates a valid local unlock code', async ({ page }) => {
  await page.goto('/success.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#code')).toHaveText(/^PRQ-\d{4}-\d{4}$/);
});
