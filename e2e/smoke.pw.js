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
    await expect(page.locator('#wt-instagram-link')).toHaveAttribute(
      'href',
      spec.lang === 'fr' ? './share.html?lang=fr' : './share.html'
    );
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
  await expect(page.locator('#poster')).toContainText('Quiz des règles du pickleball');
  await expect(page.locator('[data-poster="print"]')).toHaveText("Imprimer l'affiche");
  await expect(page.locator('[data-poster="back"]')).toHaveAttribute('href', '../fr.html');
  await expect(page.locator('[data-poster="url"]')).toHaveText('www.pickleballrulesquiz.com/fr.html');
  await expect(page.locator('#poster-qr svg')).toBeVisible();
});

test('Instagram share kit prepares an English post and a generated image', async ({
  page
}) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error.message || error)));
  const response = await page.goto('/share.html', {
    waitUntil: 'domcontentloaded'
  });
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#instagram-caption')).toHaveValue(/Try 2 games free/);
  await expect(page.locator('#instagram-caption')).toHaveValue(/utm_campaign=instagram_challenge/);
  await expect(page.locator('[data-action="download-image"]')).toBeVisible();
  await expect(page.locator('#instagram-art')).toHaveAttribute('width', '1080');
  await expect(page.locator('#instagram-art')).toHaveAttribute('height', '1350');
  await page.locator('[data-format="square"]').click();
  await expect(page.locator('#instagram-art')).toHaveAttribute('height', '1080');
  await page.locator('[data-format="story"]').click();
  await expect(page.locator('#instagram-art')).toHaveAttribute('height', '1920');
  const hasPixels = await page.locator('#instagram-art').evaluate((canvas) => {
    const data = canvas.getContext('2d').getImageData(0, 0, 1, 1).data;
    return data.some((value) => value !== 0);
  });
  expect(hasPixels).toBe(true);
  expect(pageErrors).toEqual([]);
});

test('French Instagram share kit uses the French caption and route', async ({
  page
}) => {
  const pageErrors = [];
  await page.addInitScript(() => {
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      window.__canvasText = window.__canvasText || [];
      window.__canvasText.push(String(text));
      return originalFillText.call(this, text, ...args);
    };
  });
  page.on('pageerror', (error) => pageErrors.push(String(error.message || error)));
  const response = await page.goto('/share.html?lang=fr', {
    waitUntil: 'domcontentloaded'
  });
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('[data-share="backLink"]')).toHaveText('Retour au défi');
  await expect(page.locator('#instagram-caption')).toHaveValue(/2 parties gratuites/);
  await expect(page.locator('#instagram-caption')).toHaveValue(/\/fr\.html\?utm_source=instagram/);
  expect(await page.evaluate(() => window.__canvasText || [])).toContain(
    'Basé sur le règlement USA Pickleball'
  );
  expect(pageErrors).toEqual([]);
});
