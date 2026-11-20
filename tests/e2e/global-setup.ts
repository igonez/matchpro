import fs from 'node:fs';
import { chromium, type FullConfig } from '@playwright/test';
import {
  AUTH_DIR,
  COACH_AUTH_PATH,
  STUDENT_AUTH_PATH,
  cleanupSeededEnvironment,
  loadEnvLocal,
  seedE2EEnvironment,
} from './helpers/supabase-seed';

async function addOverlayDismissalInitScript(
  context: import('@playwright/test').BrowserContext
): Promise<void> {
  await context.addInitScript(() => {
    localStorage.setItem('arenafit_coach_spotlight_tour_v2', 'completed');
    localStorage.setItem('arenafit_student_spotlight_tour_v2', 'completed');
    localStorage.setItem(
      'arenafitpro_cookie_consent_v1',
      JSON.stringify({
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
      })
    );
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  });
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  loadEnvLocal();
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://127.0.0.1:3005';
  const channel = process.env.PLAYWRIGHT_CHANNEL || 'chrome';

  const seed = await seedE2EEnvironment();

  try {
    const browser = await chromium.launch({
      channel,
      headless: true,
    });

    try {
      // 1. Authenticate Student via /login?role=student&mode=signin
      const studentContext = await browser.newContext({ baseURL });
      await addOverlayDismissalInitScript(studentContext);
      const studentPage = await studentContext.newPage();

      await studentPage.goto('/login?role=student&mode=signin', {
        waitUntil: 'domcontentloaded',
      });
      await studentPage.locator('input[type="email"]').fill(seed.studentEmail);
      await studentPage.locator('input[type="password"]').fill(seed.studentPassword);
      await studentPage.locator('button[type="submit"]').click();
      await studentPage.waitForURL(/\/app(?:$|\?|\/)/, {
        timeout: 45_000,
        waitUntil: 'commit',
      });
      await studentPage.locator('h1').first().waitFor({ state: 'visible', timeout: 30_000 });
      await studentContext.storageState({ path: STUDENT_AUTH_PATH });
      await studentContext.close();

      // 2. Authenticate Coach via /login?role=professional
      const coachContext = await browser.newContext({ baseURL });
      await addOverlayDismissalInitScript(coachContext);
      const coachPage = await coachContext.newPage();

      await coachPage.goto('/login?role=professional', {
        waitUntil: 'domcontentloaded',
      });
      await coachPage.locator('input[type="email"]').fill(seed.coachEmail);
      await coachPage.locator('input[type="password"]').fill(seed.coachPassword);
      await coachPage.locator('button[type="submit"]').click();
      await coachPage.waitForURL(/\/dashboard(?:$|\?|\/)/, {
        timeout: 45_000,
        waitUntil: 'commit',
      });
      await coachPage.locator('h1').first().waitFor({ state: 'visible', timeout: 30_000 });
      await coachContext.storageState({ path: COACH_AUTH_PATH });
      await coachContext.close();
    } finally {
      await browser.close();
    }
  } catch (err) {
    await cleanupSeededEnvironment(seed).catch(() => undefined);
    throw err;
  }
}
