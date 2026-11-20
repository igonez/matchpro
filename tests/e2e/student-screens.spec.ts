import { expect, test } from '@playwright/test';
import { visitAndAssertHealthyScreen } from './helpers/screen-assertions';
import { readSeedState } from './helpers/supabase-seed';

test.describe('Student App Screens Sweep (390x844 & 375x667)', () => {
  test('/app dashboard renders athlete greeting, active challenge, and mobile nav', async ({
    page,
  }) => {
    const seed = readSeedState();

    await visitAndAssertHealthyScreen(page, '/app', {
      primaryCtas: [page.locator('nav a, nav button')],
    });

    await expect(page.locator('h1')).toContainText(/Olá,/i);
    await expect(page.getByText(seed.challengeTitle).first()).toBeVisible();
    await expect(page.getByText(/BLOCOS DE EXECUÇÃO DE HOJE/i)).toBeVisible();
    await expect(page.locator('nav a[href="/app/missions"]')).toBeVisible();
    await expect(page.locator('nav a[href="/app/leaderboard"]')).toBeVisible();
    await expect(page.locator('nav a[href="/app/feed"]')).toBeVisible();
  });

  test('/app/missions renders dynamic weeks, blocks, and seeded missions', async ({
    page,
  }) => {
    const seed = readSeedState();

    await visitAndAssertHealthyScreen(page, '/app/missions');

    await expect(page.locator('h1')).toContainText(/Cronograma de Missões/i);
    await expect(page.getByRole('button', { name: /^Semana 1\b/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Semana 4\b/i })).toBeVisible();
    await expect(page.getByText(seed.missions.timerMissionTitle).first()).toBeAttached();
    await expect(page.getByText(seed.missions.mealMissionTitle).first()).toBeAttached();
    await expect(page.getByText(seed.missions.simpleClickMissionTitle).first()).toBeAttached();
  });

  test('/app/leaderboard renders live standings and Individual/Squads tabs', async ({
    page,
  }) => {
    const individualTab = page.getByRole('button', { name: /INDIVIDUAL/i });
    const squadsTab = page.getByRole('button', { name: /SQUADS/i });

    await visitAndAssertHealthyScreen(page, '/app/leaderboard', {
      primaryCtas: [individualTab, squadsTab],
    });

    await expect(page.locator('h1')).toContainText(/Tabela de Classificação/i);
    await expect(page.getByText(/AO VIVO/i).first()).toBeVisible();
    await expect(individualTab).toBeVisible();
    await expect(squadsTab).toBeVisible();
  });

  test('/app/feed renders Fotos & Mural da Turma tabs without broken images', async ({
    page,
  }) => {
    const photosTab = page.getByRole('button', { name: /FOTOS/i });
    const muralTab = page.getByRole('button', { name: /MURAL DA TURMA/i });

    await visitAndAssertHealthyScreen(page, '/app/feed', {
      primaryCtas: [photosTab, muralTab],
    });

    await expect(page.locator('h1')).toContainText(/Feed da Turma/i);
    await expect(photosTab).toBeVisible();
    await expect(muralTab).toBeVisible();
  });

  test('/app/materials renders Arquivos & Avisos tabs cleanly', async ({ page }) => {
    const filesTab = page.getByRole('button', { name: /Arquivos/i });
    const noticesTab = page.getByRole('button', { name: /Avisos/i });

    await visitAndAssertHealthyScreen(page, '/app/materials', {
      primaryCtas: [filesTab, noticesTab],
    });

    await expect(page.locator('h1')).toContainText(/Materiais & Avisos/i);
    await expect(filesTab).toBeVisible();
    await expect(noticesTab).toBeVisible();
  });

  test('/app/profile renders athlete profile sections cleanly', async ({ page }) => {
    await visitAndAssertHealthyScreen(page, '/app/profile');

    await expect(page.locator('h1')).toContainText(/Meu Perfil/i);
    await expect(page.getByText(/Minha Turma Atual/i)).toBeVisible();
    await expect(page.getByText(/Conquistas & Medalhas/i)).toBeVisible();
    await expect(page.getByText(/Cofre Antes & Depois/i)).toBeVisible();
    await expect(page.getByText(/Minha Galeria de Missões/i)).toBeVisible();
  });

  test('/app/camera/[missionId] renders camera validation UI with hidden bottom nav', async ({
    page,
  }) => {
    const seed = readSeedState();
    const cameraBtn = page.getByRole('button', {
      name: /ABRIR CÂMERA AO VIVO/i,
    });

    await visitAndAssertHealthyScreen(page, `/app/camera/${seed.missions.mealMissionId}`, {
      primaryCtas: [cameraBtn],
    });

    await expect(page.getByText(/CÂMERA DE VALIDAÇÃO/i)).toBeVisible();
    await expect(page.getByText(seed.missions.mealMissionTitle)).toBeVisible();
    await expect(cameraBtn).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
    await expect(page.locator('nav a[href="/app/missions"]')).toHaveCount(0);
  });
});
