const { test, expect } = require('@playwright/test');
const { readFile } = require('node:fs/promises');

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

test('Instagram share kit prepares an English post and a generated image', async ({
  page
}) => {
  const pageErrors = [];
  page.on('pageerror', (error) =>
    pageErrors.push(String(error.message || error))
  );
  const response = await page.goto('/share.html', {
    waitUntil: 'domcontentloaded'
  });
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#instagram-caption')).toHaveValue(
    /Try 2 games free/
  );
  await expect(page.locator('#instagram-caption')).toHaveValue(
    /utm_campaign=instagram_challenge/
  );
  await expect(page.locator('[data-action="download-image"]')).toBeVisible();
  await expect(page.locator('#instagram-art')).toHaveAttribute('width', '1080');
  await expect(page.locator('#instagram-art')).toHaveAttribute(
    'height',
    '1350'
  );
  await page.locator('[data-format="square"]').click();
  await expect(page.locator('#instagram-art')).toHaveAttribute(
    'height',
    '1080'
  );
  await page.locator('[data-format="story"]').click();
  await expect(page.locator('#instagram-art')).toHaveAttribute(
    'height',
    '1920'
  );
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
  page.on('pageerror', (error) =>
    pageErrors.push(String(error.message || error))
  );
  const response = await page.goto('/share.html?lang=fr', {
    waitUntil: 'domcontentloaded'
  });
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('[data-share="backLink"]')).toHaveText(
    'Retour au défi'
  );
  await expect(page.locator('[data-share="backLink"]')).toHaveAttribute(
    'href',
    './fr.html'
  );
  await expect(page.locator('[data-share="posterLink"]')).toHaveAttribute(
    'href',
    './poster/?lang=fr'
  );
  await expect(page.locator('#instagram-caption')).toHaveValue(
    /2 parties gratuites/
  );
  await expect(page.locator('#instagram-caption')).toHaveValue(
    /\/fr\.html\?utm_source=instagram/
  );
  expect(await page.evaluate(() => window.__canvasText || [])).toContain(
    'Basé sur le règlement USA Pickleball'
  );
  expect(pageErrors).toEqual([]);
});

test('Instagram kit keeps mobile controls visible and downloads the selected PNG', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/share.html?lang=fr');
  const canvas = page.locator('#instagram-art');
  await page.locator('[data-format="story"]').click();
  await expect(page.locator('[data-format="story"]')).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  const box = await canvas.boundingBox();
  expect(box.width / box.height).toBeCloseTo(1080 / 1920, 1);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('[data-action="download-image"]').click()
  ]);
  expect(download.suggestedFilename()).toBe(
    'pickleball-rules-challenge-story-fr.png'
  );
  const png = await readFile(await download.path());
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.readUInt32BE(20)).toBe(1920);
});

test('Instagram kit reports blocked clipboard access and selects the caption', async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined });
    document.execCommand = () => false;
  });
  await page.goto('/share.html');
  await page.locator('[data-action="copy-caption"]').click();
  await expect(page.getByRole('status')).toHaveText(
    'Copy the selected caption manually.'
  );
  expect(
    await page
      .locator('#instagram-caption')
      .evaluate((field) => field.selectionEnd - field.selectionStart)
  ).toBeGreaterThan(0);
});

test('an installed quiz can open the French Instagram kit offline', async ({
  page,
  context
}) => {
  // Local builds normally disable registration to avoid caching development assets.
  await page.route('**/app.bundle.js', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /const isLocalhost = [^;]+;/,
      'const isLocalhost = false;'
    );
    await route.fulfill({ response, body });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller))
    )
    .toBe(true);
  await context.setOffline(true);
  await page.goto('/share.html?lang=fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('#instagram-caption')).toHaveValue(
    /utm_campaign=instagram_challenge/
  );
});

test('French PWA shows a waiting update and activates it on request', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  // Enable the production PWA flow on the local server, even under an active worker.
  await page.addInitScript(() => {
    Object.defineProperty(window, 'WT_CONFIG', {
      configurable: true,
      set(config) {
        config.environment = 'production';
        config.serviceWorker.enabled = true;
        Object.defineProperty(window, 'WT_CONFIG', {
          configurable: true,
          writable: true,
          value: config
        });
      }
    });
  });
  await page.goto('/share.html');
  await page.evaluate(async () => {
    await navigator.serviceWorker.register(
      '/sw.js?v=test-previous&app=pickleball_rules_quiz_v1'
    );
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() =>
      page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)
    )
    .toContain('v=test-previous');

  await page.goto('/fr.html');
  const toast = page.locator('#update-toast');
  await expect(toast).toContainText('Nouvelle version disponible.');
  const apply = toast.locator('[data-action="apply-update"]');
  await expect(apply).toBeEnabled({ timeout: 10000 });
  const version = await page.evaluate(() => window.WT_CONFIG.version);
  expect(
    await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)
  ).toContain('v=test-previous');

  await apply.click();
  await expect(page).toHaveURL(/wt-refresh=/);
  await expect
    .poll(() =>
      page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)
    )
    .toContain(`v=${version}`);
  await expect(
    page.getByRole('button', { name: 'Commencer', exact: true })
  ).toBeVisible();
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

test('newsletter confirmation page: French by default, English on request, tagged play link', async ({
  page
}) => {
  await page.goto('/confirmation/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1:visible')).toHaveText(
    'Inscription confirmée !'
  );
  await expect(
    page.locator('[data-confirmation-play]:visible')
  ).toHaveAttribute('href', '../fr.html?wt-source=newsletter-confirmation');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,follow'
  );
  await page.goto('/confirmation/?lang=en', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1:visible')).toHaveText(
    'Subscription confirmed!'
  );
  await expect(
    page.locator('[data-confirmation-play]:visible')
  ).toHaveAttribute('href', '../?wt-source=newsletter-confirmation');
});
