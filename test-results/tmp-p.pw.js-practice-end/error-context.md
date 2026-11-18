# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tmp-p.pw.js >> practice end
- Location: e2e/tmp-p.pw.js:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.wt-card--end')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('.wt-card--end')

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- main:
  - link "Pickleball Rules Quiz":
    - /url: /
  - text: Mistakes Mode
  - paragraph: 1/5
  - button "Read the current question aloud": Read question aloud
  - text: For a volley serve, the ball must be below the server's waist at contact.
  - group "For a volley serve, the ball must be below the server's waist at contact.":
    - button "True"
    - button "False"
- status
- text: For a volley serve, the ball must be below the server's waist at contact.. The ball can't be at or above waist level when struck. Above the waist is a fault. 2026 USA Pickleball Official Rulebook, Rule 7.C.3.
- status
- button "Sound effects off"
- alert: Mistakes Mode Only questions you missed. Up to 10 per game. Fix it and it drops out. Miss it and it comes back. Tap anywhere to start
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | const D='/tmp/claude-0/-home-user-pickleballgame/50dcf97f-5717-5588-bf60-64f17dd3ecda/scratchpad/';
  3  | test('practice end', async ({ page }) => {
  4  |   test.setTimeout(120000);
  5  |   await page.route('https://gc.zgo.at/**', (r) => r.abort());
  6  |   await page.route('**/content.json', async (route) => {
  7  |     const response = await route.fetch(); const c = await response.json();
  8  |     c.items.forEach((i) => { i.correctAnswer = true; }); await route.fulfill({ json: c });
  9  |   });
  10 |   await page.addInitScript(() => { if(!sessionStorage.getItem('x')){localStorage.clear();sessionStorage.setItem('x','1');} });
  11 |   await page.setViewportSize({ width: 420, height: 900 });
  12 |   await page.goto('/', { waitUntil: 'domcontentloaded' });
  13 |   await page.getByRole('button', { name: 'Start', exact: true }).click({ timeout: 15000 });
  14 |   const end = page.locator('.wt-card--end');
  15 |   for (let i = 0; i < 12 && !(await end.count()); i++) {
  16 |     await page.locator('[data-action="answer-false"]').click({ timeout: 1500 }).catch(() => {});
  17 |     await page.locator('button[data-action="continue"]').click({ timeout: 1000 }).catch(() => {});
  18 |   }
  19 |   await page.locator('[data-action="start-practice"]').first().click({ timeout: 8000 });
  20 |   for (let i = 0; i < 12 && !(await end.count()); i++) {
  21 |     await page.locator('[data-action="answer-true"]').click({ timeout: 1500 }).catch(() => {});
  22 |     await page.locator('button[data-action="continue"]').click({ timeout: 1000 }).catch(() => {});
  23 |   }
> 24 |   await expect(end).toBeVisible({ timeout: 8000 });
     |                     ^ Error: expect(locator).toBeVisible() failed
  25 |   await page.waitForTimeout(1200);
  26 |   await page.screenshot({ path: D+'practice-end.png', fullPage: true });
  27 | });
  28 | 
```
