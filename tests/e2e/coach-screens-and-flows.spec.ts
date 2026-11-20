import { expect, test, type Locator } from '@playwright/test';
import {
  assertHealthyScreen,
  attachScreenMonitors,
  visitAndAssertHealthyScreen,
} from './helpers/screen-assertions';
import {
  STUDENT_AUTH_PATH,
  ensureTwoPendingSubmissionsForAudit,
  getSupabaseAdmin,
  readSeedState,
} from './helpers/supabase-seed';

test.describe('Coach Dashboard Screens Sweep (Desktop & Mobile)', () => {
  test('all 14 active /dashboard/* screens render healthy without overflow, errors, or broken images', async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const seed = readSeedState();
    const isMobileCoach = testInfo.project.name === 'coach-mobile';

    const routes = [
      '/dashboard',
      '/dashboard/challenges',
      '/dashboard/challenges/new',
      `/dashboard/challenges/${seed.challengeId}/edit`,
      `/dashboard/missions?challengeId=${seed.challengeId}`,
      '/dashboard/students',
      '/dashboard/squads',
      '/dashboard/audit',
      '/dashboard/feed',
      '/dashboard/announcements',
      '/dashboard/materials',
      `/dashboard/leaderboard?challengeId=${seed.challengeId}`,
      '/dashboard/finance',
      '/dashboard/profile',
    ];

    const buildMobilePrimaryCtas = (route: string): Locator[] | undefined => {
      if (!isMobileCoach) return undefined;
      const ctas: Locator[] = [page.locator('nav a, nav button')];
      if (route === '/dashboard') {
        ctas.push(page.locator('main button[data-tour="create-challenge-cta"]'));
      } else if (route === '/dashboard/challenges') {
        ctas.push(page.locator('main a[href="/dashboard/challenges/new"] button'));
      } else if (route === '/dashboard/audit') {
        ctas.push(page.getByRole('button', { name: /APROVAR \(→\)/i }));
      } else if (route === '/dashboard/profile' || route === '/dashboard/challenges/new') {
        ctas.push(page.locator('main button[type="submit"]'));
      }
      return ctas;
    };

    for (const route of routes) {
      await visitAndAssertHealthyScreen(page, route, {
        settleMs: 400,
        primaryCtas: buildMobilePrimaryCtas(route),
      });

      if (route === '/dashboard/squads') {
        // Seeded coach is PRO tier: must render Squads heading and never Starter FeatureGate
        await expect(
          page.getByRole('heading', { name: /Squads & Micro-equipes/i })
        ).toBeVisible();
        await expect(page.getByText(/Exclusivo Plano/i)).toHaveCount(0);
      }
    }
  });
});

test.describe('Coach Critical Regressions (Desktop)', () => {
  test('Swipe Audit approves 1st photo without skipping 2nd, rejects 2nd with reason, notifies student, and allows student retry', async ({
    page,
    browser,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'coach-desktop',
      'Stateful single-run mutation flow runs on coach-desktop'
    );

    const seed = readSeedState();
    await ensureTwoPendingSubmissionsForAudit(seed);

    await visitAndAssertHealthyScreen(page, '/dashboard/audit', {
      settleMs: 500,
    });

    // 1. Deck starts with 2 pending items and #1 is timerMissionTitle (newest today)
    await expect(page.getByText(/REGISTRO\s*1\s*DE\s*2/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(seed.missions.timerMissionTitle).first()).toBeVisible({
      timeout: 15_000,
    });

    // 2. Approve 1st photo -> 2nd photo (mealMissionTitle) must immediately become REGISTRO 1 DE 1 (not skipped!)
    const approveBtn = page.getByRole('button', { name: /APROVAR \(→\)/i });
    await expect(approveBtn).toBeVisible();
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/audit/update-status') &&
          res.request().method() === 'POST'
      ),
      approveBtn.click(),
    ]);

    await expect(page.getByText(/REGISTRO\s*1\s*DE\s*1/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(seed.missions.mealMissionTitle).first()).toBeVisible({
      timeout: 15_000,
    });

    // 3. Reject 2nd photo with reason
    const invalidateBtn = page.getByRole('button', { name: /INVALIDAR/i });
    await expect(invalidateBtn).toBeVisible();
    await invalidateBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    const reasonText = `Foto fora de foco E2E ${seed.runId}`;
    const reasonField = dialog.locator('textarea, input[type="text"]').first();
    if ((await reasonField.count()) > 0) {
      await reasonField.fill(reasonText);
    }

    const confirmInvalidateBtn = dialog.getByRole('button', {
      name: /CONFIRMAR INVALIDAÇÃO/i,
    });
    await expect(confirmInvalidateBtn).toBeVisible();
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/audit/update-status') &&
          res.request().method() === 'POST'
      ),
      confirmInvalidateBtn.click(),
    ]);

    // 4. Verify student_notifications (type = 'coach_announcement') created with reasonText in message
    const supabaseAdmin = getSupabaseAdmin();
    await expect
      .poll(
        async () => {
          const { data } = await supabaseAdmin
            .from('student_notifications')
            .select('id, type, message')
            .eq('student_id', seed.studentId)
            .eq('challenge_id', seed.challengeId)
            .eq('type', 'coach_announcement');
          return (data ?? []).some(
            (row) => typeof row.message === 'string' && row.message.includes(reasonText)
          );
        },
        { timeout: 15_000 }
      )
      .toBe(true);

    // 5. Switch to student context and verify rejected mission + same-day retry link
    const studentContext = await browser.newContext({
      baseURL: testInfo.project.use.baseURL || 'http://127.0.0.1:3005',
      storageState: STUDENT_AUTH_PATH,
      viewport: { width: 390, height: 844 },
      hasTouch: true,
    });

    try {
      const studentPage = await studentContext.newPage();
      await visitAndAssertHealthyScreen(studentPage, '/app/missions', {
        settleMs: 500,
      });

      const rejectedBadge = studentPage.getByText(/Rejeitada/i).first();
      await expect(rejectedBadge).toBeVisible({ timeout: 15_000 });

      const rejectedMissionCard = studentPage
        .locator('div')
        .filter({ hasText: seed.missions.mealMissionTitle })
        .filter({ hasText: /Rejeitada/i })
        .last();

      const retryMonitors = attachScreenMonitors(studentPage);
      try {
        await rejectedMissionCard.click();

        await studentPage.waitForURL(
          new RegExp(`/app/camera/${seed.missions.mealMissionId}`),
          { timeout: 15_000 }
        );
        await assertHealthyScreen(studentPage, { monitors: retryMonitors });
      } finally {
        retryMonitors.detach();
      }
    } finally {
      await studentContext.close();
    }
  });

  test('Coach Preview mode (/app?preview=true) is read-only without redirect loop or participant pollution', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'coach-desktop',
      'Preview navigation flow runs on coach-desktop'
    );

    const seed = readSeedState();
    const supabaseAdmin = getSupabaseAdmin();

    await visitAndAssertHealthyScreen(page, '/app?preview=true', {
      settleMs: 500,
    });

    await expect(page.getByText(/Modo Simulação/i)).toBeVisible();
    const exitPreviewBtn = page.getByRole('button', {
      name: /Voltar ao Painel/i,
    });
    await expect(exitPreviewBtn).toBeVisible();

    // Navigate to /app/missions and verify no kick-back redirect loop to /dashboard
    await visitAndAssertHealthyScreen(page, '/app/missions', {
      settleMs: 500,
    });
    expect(page.url()).toContain('/app/missions');
    await expect(page.getByText(/Modo Simulação/i)).toBeVisible();

    // Verify coach was NOT inserted into challenge_participants
    const { count, error } = await supabaseAdmin
      .from('challenge_participants')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', seed.coachId);

    expect(error).toBeNull();
    expect(count ?? 0).toBe(0);

    // Exit preview mode cleanly back to /dashboard and verify arena_preview cookie cleared
    const exitMonitors = attachScreenMonitors(page);
    try {
      await Promise.all([
        page.waitForResponse(
          (res) =>
            res.url().includes('/api/auth/exit-preview') &&
            res.request().method() === 'POST'
        ),
        exitPreviewBtn.click(),
      ]);

      await page.waitForURL(/\/dashboard(?:$|\?|\/)/, { timeout: 20_000 });
      await assertHealthyScreen(page, { monitors: exitMonitors });
    } finally {
      exitMonitors.detach();
    }

    const cookies = await page.context().cookies();
    const previewCookie = cookies.find((c) => c.name === 'arena_preview');
    expect(previewCookie?.value ?? '').toBe('');

    // Verify /app without ?preview=true redirects coach back to /dashboard (preview cookie cleared)
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/dashboard(?:$|\?|\/)/, { timeout: 20_000 });
  });

  test('Coach to Student Mural Chat syncs message with COACH badge', async ({
    page,
    browser,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'coach-desktop',
      'Cross-role Mural chat flow runs on coach-desktop'
    );

    const seed = readSeedState();
    const muralMsg = `Aviso Mural E2E ${seed.runId}`;

    await visitAndAssertHealthyScreen(page, '/dashboard/feed', {
      settleMs: 500,
    });

    // Select seeded challenge if a challenge filter <select> is present
    const challengeSelect = page.locator('select').first();
    if ((await challengeSelect.count()) > 0 && (await challengeSelect.isVisible())) {
      const hasOption = await challengeSelect
        .locator(`option[value="${seed.challengeId}"]`)
        .count();
      if (hasOption > 0) {
        await challengeSelect.selectOption(seed.challengeId);
      }
    }

    // Switch to Mural tab
    const coachMuralTab = page.getByRole('button', { name: /Mural/i }).first();
    await expect(coachMuralTab).toBeVisible();
    await coachMuralTab.click();

    const msgInput = page
      .locator('input[placeholder*="mensagem" i], textarea[placeholder*="mensagem" i]')
      .first();
    await expect(msgInput).toBeVisible({ timeout: 15_000 });
    await msgInput.fill(muralMsg);

    const sendBtn = page
      .locator('button[aria-label*="Enviar" i], button[type="submit"]')
      .first();
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    await expect(page.getByText(muralMsg)).toBeVisible({ timeout: 15_000 });

    // Switch to Student context and verify message + COACH badge in /app/feed
    const studentContext = await browser.newContext({
      baseURL: testInfo.project.use.baseURL || 'http://127.0.0.1:3005',
      storageState: STUDENT_AUTH_PATH,
      viewport: { width: 390, height: 844 },
      hasTouch: true,
    });

    try {
      const studentPage = await studentContext.newPage();
      await visitAndAssertHealthyScreen(studentPage, '/app/feed', {
        settleMs: 500,
      });

      const studentMuralTab = studentPage.getByRole('button', {
        name: /MURAL DA TURMA/i,
      });
      await expect(studentMuralTab).toBeVisible();
      await studentMuralTab.click();

      const msgCard = studentPage
        .locator('div')
        .filter({ hasText: muralMsg })
        .filter({ hasText: 'COACH' })
        .last();
      await expect(msgCard).toBeVisible({ timeout: 15_000 });
      await expect(msgCard.getByText('COACH')).toBeVisible();
    } finally {
      await studentContext.close();
    }
  });
});
