import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  assertHealthyScreen,
  assertValidPngExport,
  visitAndAssertHealthyScreen,
} from './helpers/screen-assertions';
import { getSupabaseAdmin, readSeedState } from './helpers/supabase-seed';

test.describe('Wave 2 Mission Completion Share V2 & Image Integrity', () => {
  test('simple_click mission auto-opens ShareMissionSheet without Ranking/Pódio copy and exports 1080x1920 PNG', async ({
    page,
  }, testInfo) => {
    const seed = readSeedState();

    await visitAndAssertHealthyScreen(page, '/app/missions');

    const missionCard = page
      .locator('div')
      .filter({ hasText: seed.missions.simpleClickMissionTitle })
      .filter({ hasText: /Check-in/i })
      .last();

    await expect(missionCard).toBeVisible();

    const [checkinRes] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/submissions/simple-checkin') &&
          res.request().method() === 'POST'
      ),
      missionCard.click(),
    ]);
    expect(checkinRes.status()).toBe(200);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 20_000 });

    const dialogText = await dialog.innerText();
    expect(dialogText).toContain(seed.missions.simpleClickMissionTitle);
    expect(dialogText).toMatch(/\+10\s*XP/i);
    expect(dialogText).toMatch(/Studio E2E/i);
    expect(dialogText).toMatch(/Ofensiva|dia/i);
    expect(dialogText).not.toMatch(/ranking|pódio|podio/i);

    // Verify all 4 share action buttons exist with >= 44px height
    const actionLabels = [/^Copiar$/i, /^Salvar$/i, /^Story$/i, /^Mais$/i];
    for (const label of actionLabels) {
      const btn = dialog.getByRole('button', { name: label });
      await expect(btn).toBeVisible();
      const box = await btn.boundingBox();
      expect(box, `Share button ${label} must have bounding box`).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }

    // Switch Card <-> Sticker Transparente and validate 1080x1920 PNG exports for both
    const stickerBtn = dialog.getByRole('button', { name: /Sticker Transparente/i });
    const cardBtn = dialog.getByRole('button', { name: /^Card$/i });
    const saveBtn = dialog.getByRole('button', { name: /^Salvar$/i });

    await expect(stickerBtn).toBeVisible();
    await stickerBtn.click();
    await expect(saveBtn).toBeEnabled({ timeout: 20_000 });

    const [stickerDownload] = await Promise.all([
      page.waitForEvent('download', { timeout: 20_000 }),
      saveBtn.click(),
    ]);
    const stickerFilename = stickerDownload.suggestedFilename();
    expect(stickerFilename).toMatch(/^arenafitpro-missao-.*\.png$/);
    expect(stickerFilename).not.toMatch(/ranking|podio|pódio/i);
    const stickerExportedPath = testInfo.outputPath(`sticker-${stickerFilename}`);
    await stickerDownload.saveAs(stickerExportedPath);
    assertValidPngExport(stickerExportedPath, 1080, 1920);

    await expect(cardBtn).toBeVisible();
    await cardBtn.click();
    await expect(saveBtn).toBeEnabled({ timeout: 20_000 });

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20_000 }),
      saveBtn.click(),
    ]);

    const suggestedFilename = download.suggestedFilename();
    expect(suggestedFilename).toMatch(/^arenafitpro-missao-.*\.png$/);
    expect(suggestedFilename).not.toMatch(/ranking|podio|pódio/i);

    const exportedPath = testInfo.outputPath(suggestedFilename);
    await download.saveAs(exportedPath);
    assertValidPngExport(exportedPath, 1080, 1920);

    // Close sheet cleanly
    const closeBtn = dialog.getByRole('button', { name: /Fechar/i }).first();
    await closeBtn.click();
    await expect(dialog).toBeHidden();
  });

  test('retroactive Compartilhar button on already-completed mission opens ShareMissionSheet', async ({
    page,
  }) => {
    const seed = readSeedState();
    const supabaseAdmin = getSupabaseAdmin();

    // Ensure simple_click mission is already completed today if test runs standalone
    const { data: existingSimple } = await supabaseAdmin
      .from('student_submissions')
      .select('id')
      .eq('challenge_id', seed.challengeId)
      .eq('student_id', seed.studentId)
      .eq('mission_id', seed.missions.simpleClickMissionId)
      .eq('status', 'approved')
      .limit(1);

    if (!existingSimple || existingSimple.length === 0) {
      await supabaseAdmin.from('student_submissions').insert({
        challenge_id: seed.challengeId,
        mission_id: seed.missions.simpleClickMissionId,
        student_id: seed.studentId,
        photo_url: 'simple_click',
        status: 'approved',
        caption: 'Check-in E2E',
      });
    }

    await visitAndAssertHealthyScreen(page, '/app/missions');

    const completedSection = page
      .locator('div')
      .filter({ hasText: seed.missions.simpleClickMissionTitle })
      .filter({ hasText: /Concluída/i })
      .last();

    const shareBtn = completedSection
      .getByRole('button', { name: /Compartilhar/i })
      .first();
    await expect(shareBtn).toBeVisible();

    const shareBox = await shareBtn.boundingBox();
    if (shareBox) {
      expect(shareBox.height).toBeGreaterThanOrEqual(44);
    }

    await shareBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    const dialogText = await dialog.innerText();
    expect(dialogText).toContain(seed.missions.simpleClickMissionTitle);
    expect(dialogText).toMatch(/Studio E2E/i);
    expect(dialogText).toMatch(/\+10\s*XP/i);
    expect(dialogText).not.toMatch(/ranking|pódio|podio/i);

    await dialog.getByRole('button', { name: /Fechar/i }).first().click();
    await expect(dialog).toBeHidden();
  });

  test('photo mission on /app/camera/[mealMissionId] with mocked AI opens ShareMissionSheet with photo and macros', async ({
    page,
  }) => {
    const seed = readSeedState();

    await page.route('**/api/ai/analyze-submission', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analysis: {
            isValid: true,
            isFood: true,
            summary: 'Frango grelhado com arroz integral e salada verde',
            estimatedMacros: {
              calories: '520 kcal',
              protein: '42g',
              carbs: '48g',
              fats: '12g',
            },
            feedback: 'Refeição equilibrada para o pós-treino.',
            complianceScore: 94,
          },
        }),
      });
    });

    await visitAndAssertHealthyScreen(
      page,
      `/app/camera/${seed.missions.mealMissionId}`
    );

    await expect(page.getByText(seed.missions.mealMissionTitle)).toBeVisible({
      timeout: 15_000,
    });

    const fixturePath = path.resolve(
      process.cwd(),
      'tests/e2e/fixtures/sample-meal.jpg'
    );
    await page.locator('input[type="file"]').setInputFiles(fixturePath);

    await expect(page.getByText(/REFEIÇÃO IDENTIFICADA/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/520/).first()).toBeVisible();
    await expect(page.getByText(/42/).first()).toBeVisible();

    const confirmBtn = page.getByRole('button', {
      name: /CONFIRMAR CHECK-IN/i,
    });
    await expect(confirmBtn).toBeEnabled({ timeout: 15_000 });
    await confirmBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 25_000 });

    const dialogText = await dialog.innerText();
    expect(dialogText).toContain(seed.missions.mealMissionTitle);
    expect(dialogText).toMatch(/\+10\s*XP/i);
    expect(dialogText).toMatch(/Studio E2E/i);
    expect(dialogText).toMatch(/520/);
    expect(dialogText).toMatch(/42/);
    expect(dialogText).not.toMatch(/ranking|pódio|podio/i);

    const bgPhotos = dialog.locator('img[data-role="card-bg-photo"]');
    await expect(bgPhotos.first()).toBeAttached({ timeout: 15_000 });
    await expect
      .poll(
        async () => {
          return bgPhotos.evaluateAll((imgs) => {
            const visiblePreviewImgs = imgs.filter(
              (img) => !img.closest('[aria-hidden="true"]')
            ) as HTMLImageElement[];
            return visiblePreviewImgs.some((img) => {
              const style = window.getComputedStyle(img);
              const rect = img.getBoundingClientRect();
              return (
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                Number(style.opacity) > 0 &&
                rect.width > 0 &&
                rect.height > 0 &&
                rect.right > 0 &&
                rect.left < window.innerWidth &&
                img.complete &&
                img.naturalWidth > 0
              );
            });
          });
        },
        { timeout: 15_000 }
      )
      .toBe(true);

    await dialog.getByRole('button', { name: /Fechar/i }).first().click();
    await expect(dialog).toBeHidden();
  });

  test('/app/feed and /app/profile render zero <img src="simple_click"> or broken images after simple_click submission', async ({
    page,
  }) => {
    const seed = readSeedState();
    const supabaseAdmin = getSupabaseAdmin();

    // Ensure at least one approved simple_click submission exists in DB
    const { data: existingSimple } = await supabaseAdmin
      .from('student_submissions')
      .select('id')
      .eq('challenge_id', seed.challengeId)
      .eq('student_id', seed.studentId)
      .eq('photo_url', 'simple_click')
      .eq('status', 'approved')
      .limit(1);

    if (!existingSimple || existingSimple.length === 0) {
      await supabaseAdmin.from('student_submissions').insert({
        challenge_id: seed.challengeId,
        mission_id: seed.missions.simpleClickMissionId,
        student_id: seed.studentId,
        photo_url: 'simple_click',
        status: 'approved',
        caption: 'Check-in E2E',
      });
    }

    await visitAndAssertHealthyScreen(page, '/app/feed');
    await expect(page.locator('img[src="simple_click"]')).toHaveCount(0);
    await assertHealthyScreen(page);

    await visitAndAssertHealthyScreen(page, '/app/profile');
    await expect(page.locator('img[src="simple_click"]')).toHaveCount(0);
    await assertHealthyScreen(page);
  });
});
