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

  await page
    .getByRole('button', {
      name: path === '/fr.html' ? 'Commencer' : 'Start',
      exact: true
    })
    .click();

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

test('four green bars activate double points and a mistake clears them', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await page.addInitScript(() => {
    window.comboTestEvents = [];
    window.goatcounter = {
      count: (event) => window.comboTestEvents.push(event)
    };
  });
  await page.route('**/content.json', async (route) => {
    const response = await route.fetch();
    const content = await response.json();
    content.items.forEach((item) => {
      item.correctAnswer = true;
    });
    await route.fulfill({ json: content });
  });
  await startFreshRun(page);
  for (let i = 0; i < 5; i++) {
    await page.locator('[data-action="answer-true"]').click();
    await expect(page.locator('.wt-feedback--ok')).toBeVisible();
    await page.locator('button[data-action="continue"]').click();
    await expect(page.locator('[data-action="answer-true"]')).toBeVisible();
  }
  await expect(page.locator('.wt-momentum__seg--on')).toHaveCount(4);
  await expect(page.locator('.wt-momentum__combo')).toHaveText('×2');
  await expect(page.locator('.wt-hud-metric--score')).toContainText('6');
  const comboEvents = await page.evaluate(() =>
    window.comboTestEvents.filter((event) =>
      event.path.includes('event/combo-unlocked')
    )
  );
  expect(comboEvents).toHaveLength(1);
  expect(comboEvents[0].title).toContain('threshold=4');
  await page.locator('[data-action="answer-false"]').click();
  await expect(page.locator('.wt-feedback--bad')).toBeVisible();
  await expect(page.locator('.wt-momentum__seg--on')).toHaveCount(0);
  await expect(page.locator('.wt-momentum__combo')).toHaveCount(0);
  await page.locator('button[data-action="continue"]').click();
  await page.locator('[data-action="answer-true"]').click();
  await expect(page.locator('.wt-feedback--ok')).toBeVisible();
  await expect(page.locator('.wt-hud-metric--score')).toContainText('7');
  await page.locator('button[data-action="continue"]').click();
  await page.locator('[data-action="answer-false"]').click();
  await expect(page.locator('.wt-feedback--bad')).toBeVisible();
  await page.locator('button[data-action="continue"]').click();
  await page.locator('[data-action="answer-false"]').click();
  await expect(page.locator('.wt-card--end')).toBeVisible({ timeout: 15000 });
  const completeEvents = await page.evaluate(() =>
    window.comboTestEvents.filter((event) =>
      event.path.includes('event/run-complete')
    )
  );
  expect(completeEvents).toHaveLength(1);
  expect(completeEvents[0].path).toContain('/combo-reached/');
  expect(completeEvents[0].title).toContain('combo_activations=1');
  expect(completeEvents[0].title).toContain('bonus_points=1');
  expect(completeEvents[0].title).toContain('max_correct_streak=5');
  await page.locator('.wt-card--end [data-action="start-run"]').click();
  const replayEvents = await page.evaluate(() =>
    window.comboTestEvents.filter((event) =>
      event.path.includes('event/second-run-return')
    )
  );
  expect(replayEvents).toHaveLength(1);
  expect(replayEvents[0].path).toContain('/combo-reached/');
});
