import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE_URL = 'https://studio-app-psi.vercel.app';
const ADMIN_EMAIL = 'admin@bengo.co.il';
const ADMIN_PASSWORD = 'Admin1234';
const SCREENSHOTS_DIR = '/tmp/playwright-screenshots';

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function shot(page, name) {
  const path = `${SCREENSHOTS_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 ${name}`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); // iPhone size
  const page = await context.newPage();

  const errors = [];
  const results = [];

  function ok(msg) { results.push(`✅ ${msg}`); console.log(`✅ ${msg}`); }
  function fail(msg) { results.push(`❌ ${msg}`); errors.push(msg); console.log(`❌ ${msg}`); }

  // ── 1. HOMEPAGE ──────────────────────────────────────────────
  console.log('\n── דף ראשי ──');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await shot(page, '01-homepage');

  const heroText = await page.locator('h1').first().textContent().catch(() => '');
  if (heroText) ok(`Hero נטען: "${heroText.trim().slice(0, 30)}"`)
  else fail('Hero h1 לא נמצא');

  const bookBtn = page.locator('a[href="/book"]').first();
  if (await bookBtn.count() > 0) ok('כפתור "הזמן עכשיו" קיים')
  else fail('כפתור הזמנה לא נמצא בדף הראשי');

  // ── 2. BOOKING WIZARD – STEP 1 ───────────────────────────────
  console.log('\n── אשף הזמנות ──');
  await page.goto(`${BASE_URL}/book`);
  await page.waitForLoadState('networkidle');
  await shot(page, '02-book-step1');

  await page.waitForTimeout(1500); // wait for hydration
  const serviceCards = page.locator('button').filter({ hasText: /הקלטת|מיקס|מאסטר/ });
  const count = await serviceCards.count();
  if (count > 0) ok(`שלב 1: נמצאו ${count} שירותים`)
  else fail('שלב 1: לא נמצאו שירותים – DB ריק?');

  if (count > 0) {
    await serviceCards.first().click();
    await page.waitForTimeout(800);
    await shot(page, '03-book-step2');

    // Step 2 – check for package selection
    const packages = page.locator('text=חבילה בסיסית');
    if (await packages.count() > 0) {
      ok('שלב 2: חבילה נמצאת');
      await packages.first().click();
      await page.waitForTimeout(500);

      // Pick a date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      const dateInput = page.locator('input[type="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.fill(dateStr);
        // Wait for async slot fetch to complete
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        await shot(page, '04-book-step2-date');

        // Pick first available slot (buttons with time format HH:MM)
        const slots = page.locator('button').filter({ hasText: /^\d{2}:\d{2}$/ });
        await page.waitForTimeout(500);
        const slotCount = await slots.count();
        if (slotCount > 0) {
          ok(`שלב 2: ${slotCount} slots זמינים`);
          await slots.first().click();
          await page.waitForTimeout(500);

          // Click next
          const nextBtn = page.locator('button').filter({ hasText: 'המשך' });
          if (await nextBtn.count() > 0) {
            await nextBtn.click();
            await page.waitForTimeout(800);
            await shot(page, '05-book-step3');

            // Step 3 – fill name + phone
            const nameInput = page.locator('input[type="text"]').first();
            const phoneInput = page.locator('input[type="tel"]');
            if (await nameInput.count() > 0) {
              await nameInput.fill('ישראל ישראלי');
              ok('שלב 3: שם הוזן');
            }
            if (await phoneInput.count() > 0) {
              await phoneInput.fill('0501234567');
              ok('שלב 3: טלפון הוזן');
            }

            const next3 = page.locator('button').filter({ hasText: 'המשך' });
            if (await next3.count() > 0) {
              await next3.click();
              await page.waitForTimeout(800);
              await shot(page, '06-book-step4');

              // Step 4 – agree to terms
              const checkbox = page.locator('input[type="checkbox"]');
              if (await checkbox.count() > 0) {
                await checkbox.check();
                ok('שלב 4: תנאים אושרו');
              }
              const next4 = page.locator('button').filter({ hasText: 'המשך לאישור' });
              if (await next4.count() > 0) {
                await next4.click();
                await page.waitForTimeout(800);
                await shot(page, '07-book-step5');

                // Step 5 – confirm
                const summary = await page.locator('text=סיכום הזמנה').count();
                if (summary > 0) ok('שלב 5: סיכום הזמנה מוצג');
                else fail('שלב 5: סיכום לא נמצא');

                const submitBtn = page.locator('button').filter({ hasText: 'שלח הזמנה' });
                if (await submitBtn.count() > 0) {
                  await submitBtn.click();
                  await page.waitForTimeout(3000);
                  await shot(page, '08-book-success');

                  const url = page.url();
                  if (url.includes('/booking/success')) ok('הזמנה נשלחה! דף success נטען')
                  else if (url.includes('/booking/')) ok(`הזמנה נשלחה! URL: ${url}`)
                  else fail(`שליחה נכשלה. URL: ${url}`);
                }
              }
            }
          }
        } else {
          fail(`שלב 2: אין slots ביום ${dateStr} (יתכן שהיום סגור בהגדרות)`);
          await shot(page, '04-book-no-slots');
        }
      }
    } else {
      fail('שלב 2: חבילה לא נמצאת');
    }
  }

  // ── 3. ADMIN LOGIN ────────────────────────────────────────────
  console.log('\n── Admin Login ──');
  await page.goto(`${BASE_URL}/admin/login`);
  await page.waitForLoadState('networkidle');
  await shot(page, '09-admin-login');

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  if (await emailInput.count() > 0) {
    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    await shot(page, '10-admin-login-filled');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await shot(page, '11-admin-after-login');

    const url = page.url();
    if (url.includes('/admin') && !url.includes('/login')) {
      ok(`Admin login הצליח! URL: ${url}`);

      // ── 4. ADMIN BOOKINGS ───────────────────────────────────
      await page.goto(`${BASE_URL}/admin/bookings`);
      await page.waitForLoadState('networkidle');
      await shot(page, '12-admin-bookings');

      const bookingsTitle = await page.locator('text=הזמנות').count();
      if (bookingsTitle > 0) ok('Admin: דף הזמנות נטען')
      else fail('Admin: כותרת הזמנות לא נמצאה');

      // ── 5. ADMIN CALENDAR ───────────────────────────────────
      await page.goto(`${BASE_URL}/admin/calendar`);
      await page.waitForLoadState('networkidle');
      await shot(page, '13-admin-calendar');
      const calendarLoaded = await page.locator('text=יומן').count() + await page.locator('text=לוח שנה').count();
      if (calendarLoaded > 0) ok('Admin: יומן נטען')
      else fail('Admin: יומן לא נטען');

      // ── 6. ADMIN SETTINGS ───────────────────────────────────
      await page.goto(`${BASE_URL}/admin/settings`);
      await page.waitForLoadState('networkidle');
      await shot(page, '14-admin-settings');
      const settingsLoaded = await page.locator('text=הגדרות').count();
      if (settingsLoaded > 0) ok('Admin: הגדרות נטענו')
      else fail('Admin: הגדרות לא נטענו');

    } else {
      fail(`Admin login נכשל. URL: ${url}`);
    }
  } else {
    fail('Admin login: שדה email לא נמצא');
  }

  // ── SUMMARY ──────────────────────────────────────────────────
  console.log('\n══════════════════════════════════');
  console.log('סיכום בדיקה E2E:');
  results.forEach(r => console.log(r));
  console.log(`\nסה"כ: ${results.length - errors.length} עברו, ${errors.length} נכשלו`);
  console.log(`תמונות: ${SCREENSHOTS_DIR}/`);
  if (errors.length > 0) {
    console.log('\nבאגים שנמצאו:');
    errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }
  console.log('══════════════════════════════════');

  await browser.close();
}

run().catch(e => { console.error('Playwright crash:', e); process.exit(1); });
