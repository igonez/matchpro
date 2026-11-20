import { expect, test } from '@playwright/test';
import {
  assertHealthyScreen,
  attachScreenMonitors,
  visitAndAssertHealthyScreen,
} from './helpers/screen-assertions';
import { readSeedState } from './helpers/supabase-seed';

test.describe('Public Screens Sweep & Critical Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'arenafitpro_cookie_consent_v1',
        JSON.stringify({
          essential: true,
          analytics: true,
          marketing: true,
          functional: true,
        })
      );
    });
  });

  test('/ landing page renders hero, footer, primary CTA, and Stories 9:16 mockup tab', async ({
    page,
  }) => {
    const heroPrimaryCta = page.getByRole('button', { name: /Criar Minha Conta Grátis/i }).first();

    await visitAndAssertHealthyScreen(page, '/', {
      primaryCtas: [heroPrimaryCta],
    });

    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/Transforme grupos mortos de WhatsApp/i);
    await expect(heroPrimaryCta).toBeVisible();

    const storiesTab = page.getByRole('button', { name: /Stories 9:16/i }).first();
    const interactionMonitors = attachScreenMonitors(page);
    try {
      if ((await storiesTab.count()) > 0) {
        await storiesTab.scrollIntoViewIfNeeded();
        await storiesTab.click();
        const mockupImg = page.locator('img[src*="student-workout-selfie.jpg"]').first();
        await expect(mockupImg).toBeVisible();
      }

      await assertHealthyScreen(page, {
        primaryCtas: [heroPrimaryCta],
        monitors: interactionMonitors,
      });
    } finally {
      interactionMonitors.detach();
    }
  });

  test('/login supports student/coach role toggle and links to /esqueci-senha', async ({
    page,
  }) => {
    await visitAndAssertHealthyScreen(page, '/login', {
      primaryCtas: [page.locator('button[type="submit"]')],
    });

    await expect(page.locator('h1')).toContainText(/Área do Atleta/i);

    const toggleMonitors = attachScreenMonitors(page);
    try {
      await page.getByRole('button', { name: /Sou Treinador/i }).click();
      await expect(page.locator('h1')).toContainText(/Portal do Treinador/i);
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('a[href*="esqueci-senha"]')).toBeVisible();

      await assertHealthyScreen(page, {
        primaryCtas: [page.locator('button[type="submit"]')],
        monitors: toggleMonitors,
      });
    } finally {
      toggleMonitors.detach();
    }

    await page.getByRole('button', { name: /Sou Aluno/i }).click();
    await expect(page.locator('h1')).toContainText(/Área do Atleta/i);
    await page.getByRole('button', { name: /Já sou da Turma/i }).click();
    await expect(
      page.getByRole('button', { name: /Acessar Meu App/i })
    ).toBeVisible();
  });

  test('/esqueci-senha renders password reset form and link to /login', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first();
    await visitAndAssertHealthyScreen(page, '/esqueci-senha', {
      primaryCtas: [submitBtn],
    });

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(submitBtn).toBeVisible();
    await expect(page.locator('a[href*="/login"]').first()).toBeVisible();
  });

  test('/ajuda renders FAQ search, accordion toggle, and WhatsApp support CTA', async ({
    page,
  }) => {
    const whatsappCta = page.getByRole('link', { name: /Suporte WhatsApp/i });
    await visitAndAssertHealthyScreen(page, '/ajuda', {
      primaryCtas: [whatsappCta],
    });

    await expect(page.locator('h1')).toContainText(/Central de Ajuda & FAQ/i);
    await expect(
      page.getByPlaceholder(/Buscar dúvida ou tópico/i)
    ).toBeVisible();
    await expect(whatsappCta).toBeVisible();

    const firstFaqBtn = page
      .locator('main button')
      .filter({ hasText: /\?/ })
      .first();
    await expect(firstFaqBtn).toBeVisible();
    const faqMonitors = attachScreenMonitors(page);
    try {
      await firstFaqBtn.click();
      await assertHealthyScreen(page, { monitors: faqMonitors });
    } finally {
      faqMonitors.detach();
    }
  });

  test('/termos renders terms heading and corporate footer', async ({ page }) => {
    await visitAndAssertHealthyScreen(page, '/termos');
    await expect(page.locator('h1')).toContainText(/Termos e Condições de Uso/i);
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
  });

  test('/privacidade renders privacy policy and LGPD link', async ({ page }) => {
    await visitAndAssertHealthyScreen(page, '/privacidade');
    await expect(page.locator('h1')).toContainText(/Política de Privacidade/i);
    await expect(page.locator('a[href="/lgpd"]').first()).toBeVisible();
  });

  test('/lgpd renders DPO form and primary submit button', async ({ page }) => {
    const dpoSubmit = page.getByRole('button', { name: /Enviar Solicitação ao DPO/i });
    await visitAndAssertHealthyScreen(page, '/lgpd', {
      primaryCtas: [dpoSubmit],
    });

    await expect(page.locator('h1')).toContainText(/Portal de Privacidade/i);
    await expect(dpoSubmit).toBeVisible();
  });

  test('/join/[challengeId] renders seeded challenge invite and conversion CTA', async ({
    page,
  }) => {
    const seed = readSeedState();
    const joinCta = page
      .getByRole('button', {
        name: /Criar Conta e Entrar na Turma|Entrar na Turma Agora|Confirmar Minha Inscrição/i,
      })
      .first();

    await visitAndAssertHealthyScreen(page, `/join/${seed.challengeId}`, {
      primaryCtas: [joinCta],
      settleMs: 600,
    });

    await expect(page.locator('h1')).toContainText(seed.challengeTitle);
    await expect(page.getByText(/Convite Oficial/i).first()).toBeVisible();
    await expect(joinCta).toBeVisible();
  });
});
