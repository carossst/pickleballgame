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

test('free run end screen offers a visible way to share the score', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await startFreshRun(page);
  for (let i = 0; i < 15; i++) {
    if (await page.locator('.wt-card--end').isVisible()) break;
    await page
      .locator('[data-action="answer-true"]')
      .click({ timeout: 2000 })
      .catch(() => {});
    await page
      .locator('button[data-action="continue"]')
      .click({ timeout: 1000 })
      .catch(() => {});
  }
  await expect(page.locator('.wt-card--end')).toBeVisible();
  await expect(
    page
      .locator('[data-action="share-native"], [data-action="copy-share"]')
      .first()
  ).toBeVisible();
  await expect(
    page.locator('.wt-card--end a[href*="share.html"]')
  ).toBeVisible();
});

test('statement box keeps the verdict colour while the feedback is shown', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await page.route('**/content.json', async (route) => {
    const response = await route.fetch();
    const content = await response.json();
    content.items.forEach((item) => {
      item.correctAnswer = true;
    });
    await route.fulfill({ json: content });
  });
  await startFreshRun(page);
  await page.locator('[data-action="answer-true"]').click();
  await expect(page.locator('.wt-feedback--ok')).toBeVisible();
  await page.waitForTimeout(150);
  const heightEarly = (await page.locator('.wt-terms-box').boundingBox())
    .height;
  await page.waitForTimeout(1500);
  const heightLate = (await page.locator('.wt-terms-box').boundingBox()).height;
  expect(heightLate).toBe(heightEarly);
  await expect(page.locator('.wt-feedback--ok')).toBeVisible();
  await expect(page.locator('.wt-terms-box')).toHaveCSS(
    'background-color',
    'rgb(21, 128, 61)'
  );
});

test('end screen offers the score card and downloads it as an image', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await page.route('**/content.json', async (route) => {
    const response = await route.fetch();
    const content = await response.json();
    content.items.forEach((item) => {
      item.correctAnswer = true;
    });
    await route.fulfill({ json: content });
  });
  await startFreshRun(page);
  for (let i = 0; i < 8; i++) {
    if (await page.locator('.wt-card--end').isVisible()) break;
    await page
      .locator('[data-action="answer-true"]')
      .click({ timeout: 2000 })
      .catch(() => {});
    await page
      .locator('button[data-action="continue"]')
      .click({ timeout: 1500 })
      .catch(() => {});
  }
  const card = page.locator('[data-action="share-card"]');
  await expect(card).toBeVisible();
  const download = page.waitForEvent('download');
  await card.click();
  expect((await download).suggestedFilename()).toMatch(
    /^pickleball-score-\d+\.png$/
  );
});

test('rule explanation shows a court diagram for tagged questions', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await startFreshRun(page);
  await page.locator('[data-action="answer-true"]').click();
  await expect(page.locator('.wt-explanation .wt-court-diagram')).toBeVisible();
});

test('first free game shows every explanation even when all answers are wrong', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await page.route('**/content.json', async (route) => {
    const response = await route.fetch();
    const content = await response.json();
    content.items.forEach((item) => {
      item.correctAnswer = true;
    });
    await route.fulfill({ json: content });
  });
  await startFreshRun(page);
  await expect(page.locator('.wt-hud-metric--mistakes')).toHaveCount(0);
  for (let i = 0; i < 5; i++) {
    await page.locator('[data-action="answer-false"]').click();
    await expect(page.locator('.wt-feedback--bad')).toBeVisible();
    await expect(page.locator('.wt-explanation')).toBeVisible();
    await page.locator('button[data-action="continue"]').click();
  }
  await expect(page.locator('.wt-card--end')).toBeVisible();
});

test('Rapid Fire: paddle, wave banner and life capsule', async ({ page }) => {
  test.setTimeout(90000);
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await page.route('**/content.json', async (route) => {
    const response = await route.fetch();
    const content = await response.json();
    content.items.forEach((item) => {
      item.correctAnswer = true;
    });
    await route.fulfill({ json: content });
  });
  // Open Rapid Fire right away: the button normally waits for two games.
  await page.route('**/app.bundle.js*', async (route) => {
    const response = await route.fetch();
    const body = (await response.text())
      .replace(/endAfterRuns:\s*2/, 'endAfterRuns: 0')
      .replace(/landingAfterRuns:\s*2/, 'landingAfterRuns: 0');
    await route.fulfill({ response, body });
  });
  // startFreshRun clears storage on every load, which would also wipe the game
  // state before the reload below: clear it once per tab instead.
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem('wt-e2e-cleared')) {
      window.localStorage.clear();
      window.sessionStorage.setItem('wt-e2e-cleared', '1');
    }
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('button', { name: 'Start', exact: true })
    .click({ timeout: 15000 });
  await expect(page.locator('[data-action="answer-true"]')).toBeVisible({
    timeout: 15000
  });
  for (let i = 0; i < 6; i++) {
    if (await page.locator('.wt-card--end').isVisible()) break;
    await page
      .locator('[data-action="answer-true"]')
      .click({ timeout: 2000 })
      .catch(() => {});
    await page
      .locator('button[data-action="continue"]')
      .click({ timeout: 1500 })
      .catch(() => {});
  }
  await expect(page.locator('.wt-card--end')).toBeVisible();
  // Rapid Fire only uses questions already seen: mark a pool of them as seen.
  await page.evaluate(() => {
    for (const key of Object.keys(window.localStorage)) {
      try {
        const json = JSON.parse(window.localStorage.getItem(key));
        const holder =
          json &&
          (json.statsByItem
            ? json
            : json.data && json.data.statsByItem
              ? json.data
              : null);
        if (!holder) continue;
        for (let id = 1; id <= 14; id++) {
          holder.statsByItem[id] = Object.assign({}, holder.statsByItem[id], {
            seenCount: 1
          });
        }
        window.localStorage.setItem(key, JSON.stringify(json));
        return;
      } catch (_) {}
    }
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page
    .locator('[data-wt-secret="chest"]:visible')
    .first()
    .click({ timeout: 15000 });
  await page
    .locator('#modal [data-action="enter-secret-bonus"]')
    .click({ timeout: 8000 });
  await expect(page.locator('[data-wt-bonus-lane]')).toBeVisible({
    timeout: 8000
  });
  await page.waitForTimeout(800);
  await page.mouse.click(640, 330); // dismisses the start panel
  await expect(page.locator('[data-action="answer-true"]')).toBeVisible();

  let step = 0;
  const answer = async (name) => {
    step += 1;
    try {
      await page.locator(`[data-action="${name}"]`).click({ timeout: 4000 });
      await page.waitForTimeout(450); // answers are locked for a moment after each click
    } catch (error) {
      const text = (await page.locator('body').innerText())
        .replace(/\s+/g, ' ')
        .slice(0, 300);
      throw new Error(`answer ${step} (${name}) failed; page: ${text}`);
    }
  };
  // The paddle move lasts under half a second: check it right after the click.
  await page.locator('[data-action="answer-true"]').click();
  await expect(page.locator('.wt-rf-paddle.is-hit-left')).toBeVisible();
  await page.waitForTimeout(450);
  step += 1;
  await answer('answer-true');
  await answer('answer-false'); // one mistake
  await expect(page.locator('.wt-hud-metric--mistakes')).toContainText('1/3');
  for (let i = 0; i < 8; i++) await answer('answer-true');
  await expect(page.locator('.wt-rf-capsule')).toContainText('+1 LIFE');
  await expect(page.locator('.wt-hud-metric--mistakes')).toContainText('0/3');
});

test('newsletter signup: link, validation and Kit form post', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await page.route('**/content.json', async (route) => {
    const response = await route.fetch();
    const content = await response.json();
    content.items.forEach((item) => {
      item.correctAnswer = true;
    });
    await route.fulfill({ json: content });
  });
  // The feature is off until the owner pastes the Kit form URLs: turn it on for this test.
  await page.route('**/app.bundle.js*', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /en:\s*"",\s*fr:\s*"https:\/\/app\.kit\.com\/forms\/10204850\/subscriptions"/,
      'en: "https://kit.example.test/forms/1/subscriptions", fr: ""'
    );
    await route.fulfill({ response, body });
  });
  const posts = [];
  await page.route('https://kit.example.test/**', async (route) => {
    posts.push(route.request().postData() || '');
    await route.fulfill({ status: 200, body: '' });
  });
  await startFreshRun(page);
  for (let i = 0; i < 8; i++) {
    if (await page.locator('.wt-card--end').isVisible()) break;
    await page
      .locator('[data-action="answer-true"]')
      .click({ timeout: 2000 })
      .catch(() => {});
    await page
      .locator('button[data-action="continue"]')
      .click({ timeout: 1500 })
      .catch(() => {});
  }
  await page.locator('[data-action="open-newsletter"]').click();
  await page.locator('#wt-nl-email').fill('not-an-email');
  await page.locator('[data-action="confirm-newsletter"]').click();
  await expect(page.locator('#wt-nl-msg')).toContainText('valid email');
  expect(posts).toHaveLength(0);
  await page.locator('#wt-nl-email').fill('test@example.com');
  await page.locator('#wt-nl-first').fill('Marie');
  await page.locator('[data-action="confirm-newsletter"]').click();
  await expect(page.locator('#wt-nl-msg')).toContainText('check your inbox');
  expect(posts).toHaveLength(1);
  expect(posts[0]).toContain('email_address=test%40example.com');
  expect(posts[0]).toContain('first_name%5D=Marie');
});

test('French newsletter form posts the configured Kit fields (request intercepted)', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await page.route('**/content.json', async (route) => {
    const response = await route.fetch();
    const content = await response.json();
    content.items.forEach((item) => {
      item.correctAnswer = true;
    });
    await route.fulfill({ json: content });
  });
  const posts = [];
  await page.route(
    'https://app.kit.com/forms/10204850/subscriptions',
    async (route) => {
      posts.push(route.request().postData() || '');
      await route.fulfill({ status: 200, body: '' });
    }
  );
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.goto('/fr.html', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('button', { name: 'Commencer', exact: true })
    .click({ timeout: 15000 });
  for (let i = 0; i < 8; i++) {
    if (await page.locator('.wt-card--end').isVisible()) break;
    await page
      .locator('[data-action="answer-true"]')
      .click({ timeout: 2000 })
      .catch(() => {});
    await page
      .locator('button[data-action="continue"]')
      .click({ timeout: 1500 })
      .catch(() => {});
  }
  await page.locator('[data-action="open-newsletter"]').click();
  await page.locator('#wt-nl-email').fill('test@example.com');
  await page.locator('#wt-nl-first').fill('Marie');
  await page.locator('[data-action="confirm-newsletter"]').click();
  await expect(page.locator('#wt-nl-msg')).toContainText('boîte mail');
  expect(posts).toHaveLength(1);
  expect(posts[0]).toContain('email_address=test%40example.com');
  expect(posts[0]).toContain('fields%5Bfirst_name%5D=Marie');
});

test('newsletter link is hidden while no Kit form is configured', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await startFreshRun(page);
  for (let i = 0; i < 12; i++) {
    if (await page.locator('.wt-card--end').isVisible()) break;
    await page
      .locator('[data-action="answer-true"]')
      .click({ timeout: 2000 })
      .catch(() => {});
    await page
      .locator('button[data-action="continue"]')
      .click({ timeout: 1500 })
      .catch(() => {});
  }
  await expect(page.locator('.wt-card--end')).toBeVisible();
  await expect(page.locator('[data-action="open-newsletter"]')).toHaveCount(0);
});

test('question statement is readable: text contrasts with its box', async ({
  page
}) => {
  await page.route('https://gc.zgo.at/**', (route) => route.abort());
  await startFreshRun(page);
  const colors = await page.evaluate(() => {
    const box = getComputedStyle(document.querySelector('.wt-terms-box'));
    const word = getComputedStyle(document.querySelector('.wt-term-word'));
    return { background: box.backgroundColor, text: word.color };
  });
  expect(colors.background).not.toBe(colors.text);
  expect(colors.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(colors.background).not.toBe('rgb(255, 255, 255)');
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
  // Free runs are capped to a few questions; this flow needs a longer run,
  // so the cap is removed from the served config for this test only.
  await page.route('**/app.bundle.js*', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /maxQuestionsByRun:\s*\{[^}]*\}/,
      'maxQuestionsByRun: {}'
    );
    await route.fulfill({ response, body });
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
