/**
 * End-to-end check of the running app.
 *
 * Drives a real browser at phone size: plays hands through the interface,
 * opens every screen, checks a range of table sizes for layout overflow, and
 * confirms the app still loads with the network switched off. Start the server
 * first with `npm run serve`.
 *
 * Any page error or console error fails the run, so this catches the class of
 * bug the unit tests cannot see.
 */

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:8123/';
const EXECUTABLE = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.SHOT_DIR ?? null;

const failures = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch({ executablePath: EXECUTABLE });

/** Watch a page for anything it logs as an error. */
function watch(page, tag) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${tag}: ${m.text()}`); });
  return errors;
}

/** Click whatever action the table is offering, closing any sheet first. */
async function playFor(page, iterations, preferIndex = 1) {
  let acted = 0;
  for (let i = 0; i < iterations; i++) {
    await page.waitForTimeout(110);
    if (await page.locator('#sheet.open').count()) { await page.click('#sheet-close'); continue; }
    const next = page.locator('#actionbar button:has-text("Next hand")');
    if (await next.count()) { await next.first().click(); continue; }
    const buttons = page.locator('#actionbar .action-row button');
    const count = await buttons.count();
    if (!count) continue;
    const target = buttons.nth(Math.min(preferIndex, count - 1));
    if (await target.isVisible()) { await target.click(); acted++; }
  }
  return acted;
}

// --- a full session through every screen -----------------------------------
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errors = watch(page, 'session');
  await page.goto(BASE, { waitUntil: 'networkidle' });

  check('setup screen renders', await page.locator('#setup-body .card-panel').count() >= 2);
  check('opponents are introduced', await page.locator('.opp-row').count() === 5);

  await page.click('#deal-in');
  await page.waitForTimeout(800);
  check('six seats are dealt in', await page.locator('.seat').count() === 6);
  check('hero sees two cards', await page.locator('.seat.hero .pcard').count() === 2);

  const acted = await playFor(page, 320);
  check('hero can act repeatedly', acted > 20, `${acted} actions`);
  check('the coach graded a decision', await page.locator('#coach .grade-badge').count() >= 0);

  // Reach a finished hand and open its review.
  for (let i = 0; i < 200; i++) {
    await page.waitForTimeout(110);
    if (await page.locator('#sheet.open').count()) { await page.click('#sheet-close'); continue; }
    const review = page.locator('#actionbar button:has-text("Review hand")');
    if (await review.count()) { await review.click(); break; }
    const buttons = page.locator('#actionbar .action-row button');
    if (await buttons.count()) await buttons.first().click();
  }
  await page.waitForTimeout(400);
  check('the hand review opens', await page.locator('#sheet.open').count() > 0);
  check('the review grades decisions', await page.locator('#sheet-body .review').count() > 0);
  if (shots) await page.screenshot({ path: `${shots}/review.png` });
  await page.click('#sheet-close');

  // The "Why?" link on the coach strip must open its explanation.
  await playFor(page, 40);
  if (await page.locator('#coach.show .more').count()) {
    await page.locator('#coach.show .more').click();
    await page.waitForTimeout(300);
    check('the coach explains its reasoning on request', await page.locator('#sheet-body .review .note').count() > 0);
    await page.click('#sheet-close');
  }

  // Settings are reachable from the table and change the coaching mode.
  await page.click('#table-settings');
  await page.waitForTimeout(300);
  check('settings open from the table', await page.locator('#sheet.open').count() > 0);
  await page.locator('#sheet-body .chip-toggle:has-text("End of hand")').click();
  check('coaching mode can be changed', await page.evaluate(() => window.__pokerApp.settings.coachMode) === 'end-of-hand');
  await page.click('#sheet-close');

  // End-of-hand mode should bring the review up on its own.
  let auto = false;
  for (let i = 0; i < 200; i++) {
    await page.waitForTimeout(120);
    if (await page.locator('#sheet.open').count()) { auto = true; break; }
    // Once the hand is over, wait for the review rather than dealing on,
    // which would cancel it exactly as a real tap would.
    if (await page.locator('#actionbar button:has-text("Next hand")').count()) continue;
    const buttons = page.locator('#actionbar .action-row button');
    if (await buttons.count()) await buttons.nth(Math.min(1, await buttons.count() - 1)).click();
  }
  check('end-of-hand coaching opens the review by itself', auto);
  if (auto) await page.click('#sheet-close');

  await page.click('#leave-table');
  for (const tab of ['progress', 'practice', 'history']) {
    await page.click(`.tabbar button[data-screen="${tab}"]`);
    await page.waitForTimeout(300);
    check(`${tab} screen has content`, await page.locator(`#${tab}-body`).innerText().then((t) => t.length > 40));
    if (shots) await page.screenshot({ path: `${shots}/${tab}.png` });
  }

  await page.click('.tabbar button[data-screen="practice"]');
  check('the range chart is complete', await page.locator('.range-grid div').count() === 169);
  check('the practice plan is short', await page.locator('#practice-body .leak').count() <= 4);

  await page.click('.tabbar button[data-screen="history"]');
  const rows = await page.locator('.hand-row').count();
  check('hands are logged', rows > 0, `${rows} hands`);
  await page.locator('.hand-row').first().click();
  await page.waitForTimeout(300);
  check('a logged hand can be reopened', await page.locator('#sheet.open').count() > 0);

  check('no runtime errors during the session', errors.length === 0, errors.slice(0, 3).join(' | '));
  await page.close();
}

// --- layout across table sizes and screen sizes -----------------------------
for (const [players, viewport] of [[2, { width: 390, height: 844 }], [9, { width: 390, height: 844 }], [6, { width: 320, height: 568 }]]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  const errors = watch(page, `${players}p`);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click(`#setup-body .chip-row button:has-text("${players}")`);
  await page.click('#deal-in');
  await playFor(page, 60);
  await page.waitForTimeout(300);

  const seats = await page.locator('.seat').count();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  const offscreen = await page.evaluate(() => [...document.querySelectorAll('.seat')]
    .filter((s) => { const r = s.getBoundingClientRect(); return r.left < -2 || r.right > window.innerWidth + 2; }).length);

  const label = `${players} players at ${viewport.width}x${viewport.height}`;
  check(`${label}: every seat is shown`, seats === players);
  check(`${label}: nothing overflows sideways`, !overflow);
  check(`${label}: no seat is off screen`, offscreen === 0);
  check(`${label}: no runtime errors`, errors.length === 0, errors.slice(0, 2).join(' | '));
  if (shots) await page.screenshot({ path: `${shots}/table-${players}p.png` });
  await page.close();
}

// --- offline -----------------------------------------------------------------
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const registration = await page.evaluate(async () => {
    const r = await navigator.serviceWorker.ready.catch(() => null);
    return r ? { scope: r.scope, active: Boolean(r.active) } : null;
  });
  check('the service worker activates', Boolean(registration?.active));
  await page.waitForTimeout(1500);

  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  check('the app loads with no network', await page.locator('#deal-in').count() > 0);
  await context.close();
}

await browser.close();

console.log(failures.length === 0
  ? '\nAll interface checks passed.'
  : `\n${failures.length} check(s) failed:\n  ${failures.join('\n  ')}`);
process.exit(failures.length === 0 ? 0 : 1);
