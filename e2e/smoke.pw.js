const { test, expect } = require('@playwright/test');

const pages = [
  { path: '/', landing: 'Start', lang: 'en' },
  { path: '/fr.html', landing: 'Commencer', lang: 'fr' }
];

for (const spec of pages) {
  test(`${spec.lang} app boots and renders the landing screen`, async ({
    page
  }) => {
    const pageErrors = [];
    page.on('pageerror', (error) =>
      pageErrors.push(String(error && error.message ? error.message : error))
    );

    const response = await page.goto(spec.path, {
      waitUntil: 'domcontentloaded'
    });
    expect(response && response.ok()).toBeTruthy();
    await expect(page.locator('#app')).toContainText(spec.landing, {
      timeout: 15000
    });
    await expect(page.locator('html')).toHaveAttribute('lang', spec.lang);
    expect(pageErrors).toEqual([]);
  });

  test(`${spec.lang} fresh profile keeps the Daily Challenge behind first play`, async ({
    page
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.goto(spec.path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app')).toContainText(spec.landing, {
      timeout: 15000
    });
    await expect(
      page.locator('[data-action="start-daily-challenge"]')
    ).toHaveCount(0);
  });
}

test('language switch navigates to the French entry page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toContainText('Start', { timeout: 15000 });
  const switcher = page.locator('[data-wt-locale-swap-to="fr"]');
  await expect(switcher).toBeVisible();
  await switcher.click();
  await expect(page).toHaveURL(/\/fr\.html(?:[?#].*)?$/);
  await expect(page.locator('#app')).toContainText('Commencer', {
    timeout: 15000
  });
});

test('critical PWA assets are published', async ({ request }) => {
  for (const path of [
    '/app.bundle.js',
    '/style.css',
    '/content.json',
    '/sw.js',
    '/manifest.json',
    '/manifest.fr.json'
  ]) {
    const response = await request.get(path);
    expect(response.ok(), path).toBeTruthy();
  }
});

test('mobile landing stays within the viewport and keeps the primary CTA usable', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const start = page.getByRole('button', { name: 'Start', exact: true });
  await expect(start).toBeVisible({ timeout: 15000 });
  const box = await start.boundingBox();
  expect(box).toBeTruthy();
  expect(box.height).toBeGreaterThanOrEqual(44);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(overflow).toBe(false);
});

test('poster route renders a QR code and fits one printed A4 page', async ({
  page
}) => {
  const response = await page.goto('/poster', {
    waitUntil: 'domcontentloaded'
  });
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('#poster-qr svg')).toBeVisible();
  await expect(page.locator('[data-action="print-poster"]')).toBeVisible();

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-action="print-poster"]')).toBeHidden();
  const poster = page.locator('#poster');
  const box = await poster.boundingBox();
  expect(box).toBeTruthy();
  expect(box.width).toBeGreaterThan(700);
  expect(box.height).toBeGreaterThan(1000);

  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  expect((pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length).toBe(
    1
  );
});

test('French poster is localized and links back to the French quiz', async ({
  page
}) => {
  const response = await page.goto('/poster/?lang=fr', {
    waitUntil: 'domcontentloaded'
  });
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('#poster')).toContainText(
    'Défi des règles du pickleball'
  );
  await expect(page.locator('[data-poster="print"]')).toHaveText(
    "Imprimer l'affiche"
  );
  await expect(page.locator('[data-poster="back"]')).toHaveAttribute(
    'href',
    '../fr.html'
  );
  await expect(page.locator('[data-poster="url"]')).toHaveText(
    'www.pickleballrulesquiz.com/fr.html'
  );
  await expect(page.locator('#poster-qr svg')).toBeVisible();
});

test('poster for a club shows its name and tags the QR code', async ({
  page
}) => {
  await page.goto('/poster/?club=%C3%89vry%20Pickle', {
    waitUntil: 'domcontentloaded'
  });
  await expect(page.locator('#poster')).toContainText(
    'Brought to you by Évry Pickle'
  );
  await expect(page.locator('#poster-qr')).toHaveAttribute(
    'data-url',
    'https://www.pickleballrulesquiz.com/?wt-source=club-evry-pickle'
  );
  await expect(page.locator('#poster-qr svg')).toBeVisible();
});

test('clubs page builds tagged links from a club name', async ({ page }) => {
  await page.goto('/clubs/?lang=en', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#clubs-results')).toBeHidden();
  await page.locator('#club-name').fill('Évry Pickle');
  await expect(page.locator('#clubs-results')).toBeVisible();
  await expect(page.locator('#clubs-results')).toContainText(
    'club-evry-pickle'
  );
  await expect(page.locator('#clubs-qr')).toHaveAttribute(
    'data-url',
    'https://www.pickleballrulesquiz.com/?wt-source=club-evry-pickle'
  );
  await page.locator('#club-kind').selectOption('coach');
  await expect(page.locator('#clubs-results')).toContainText(
    'coach-evry-pickle'
  );
});
