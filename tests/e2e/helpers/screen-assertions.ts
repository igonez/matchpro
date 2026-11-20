import fs from 'node:fs';
import {
  expect,
  type ConsoleMessage,
  type Locator,
  type Page,
  type Response,
} from '@playwright/test';

export interface HealthyScreenOptions {
  /** Primary CTA locators that must be >= 44px tall on mobile viewports (width <= 430). */
  primaryCtas?: Locator[];
  /** Optional text/selector to wait for before asserting layout health. */
  waitForSelector?: string;
  /** Optional extra settle time (ms) after skeletons disappear. */
  settleMs?: number;
  /** If true (default), ignores blocked third-party ad pixel console noise while still failing on all first-party/hydration/JS errors. */
  ignoreThirdPartyAdPixelErrors?: boolean;
  /** Optional active monitor handle; if passed to assertHealthyScreen, also asserts zero runtime/HTTP errors. */
  monitors?: ScreenMonitors;
}

export interface ScreenMonitors {
  assertNoRuntimeErrors: () => void;
  reset: () => void;
  detach: () => void;
}

const THIRD_PARTY_NOISE_PATTERNS = [
  /connect\.facebook\.net/i,
  /facebook\.com\/tr/i,
  /googletagmanager\.com/i,
  /google-analytics\.com/i,
];

const HYDRATION_PATTERN =
  /hydration|did not match|text content does not match|server-rendered html/i;

function isThirdPartyAdPixelUrl(url: string): boolean {
  return THIRD_PARTY_NOISE_PATTERNS.some((re) => re.test(url));
}

function isFirstPartyUrl(url: string): boolean {
  return (
    url.startsWith('http://127.0.0.1:3005') ||
    url.startsWith('http://localhost:3005')
  );
}

function isSupabaseApiUrl(url: string): boolean {
  const isSupabaseServicePath =
    url.includes('/rest/v1/') || url.includes('/storage/v1/');
  if (!isSupabaseServicePath) return false;

  const configuredSupabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '') || '';
  if (configuredSupabaseUrl && url.startsWith(configuredSupabaseUrl)) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

function isMonitoredHttpUrl(url: string): boolean {
  return isFirstPartyUrl(url) || isSupabaseApiUrl(url);
}

export function attachScreenMonitors(
  page: Page,
  options?: Pick<HealthyScreenOptions, 'ignoreThirdPartyAdPixelErrors'>
): ScreenMonitors {
  const ignoreThirdParty = options?.ignoreThirdPartyAdPixelErrors ?? true;
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const httpErrors: string[] = [];

  const onPageError = (err: Error) => {
    pageErrors.push(err.message || String(err));
  };

  const onConsole = (msg: ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();

    if (HYDRATION_PATTERN.test(text)) {
      consoleErrors.push(`[hydration] ${text}`);
      return;
    }

    if (type === 'error') {
      const locationUrl = msg.location()?.url || '';
      if (
        ignoreThirdParty &&
        (isThirdPartyAdPixelUrl(text) || isThirdPartyAdPixelUrl(locationUrl))
      ) {
        return;
      }
      consoleErrors.push(text);
    }
  };

  const onResponse = (res: Response) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400 && isMonitoredHttpUrl(url)) {
      httpErrors.push(`${status} ${res.request().method()} ${url}`);
    }
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('response', onResponse);

  return {
    assertNoRuntimeErrors: () => {
      expect(
        httpErrors,
        `First-party/Supabase HTTP >= 400 responses: ${httpErrors.join('; ')}`
      ).toEqual([]);
      expect(pageErrors, `Uncaught pageerror events: ${pageErrors.join('; ')}`).toEqual([]);
      expect(consoleErrors, `Console/hydration errors: ${consoleErrors.join('; ')}`).toEqual([]);
    },
    reset: () => {
      pageErrors.length = 0;
      consoleErrors.length = 0;
      httpErrors.length = 0;
    },
    detach: () => {
      page.off('pageerror', onPageError);
      page.off('console', onConsole);
      page.off('response', onResponse);
    },
  };
}

export async function waitForScreenSettled(
  page: Page,
  options?: Pick<HealthyScreenOptions, 'waitForSelector' | 'settleMs'>
): Promise<void> {
  await page.waitForLoadState('domcontentloaded');

  if (options?.waitForSelector) {
    await page.locator(options.waitForSelector).first().waitFor({
      state: 'visible',
      timeout: 20_000,
    });
  }

  // Wait for initial loading screens/banners containing "CARREGANDO" or "SINCRONIZANDO" to clear
  const loadingIndicator = page
    .locator('text=/CARREGANDO|SINCRONIZANDO/i')
    .first();
  if ((await loadingIndicator.count()) > 0) {
    await loadingIndicator.waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => undefined);
  }

  // Wait for MobileLoadingScreen (fixed inset-0 z-[100], 800ms + 250ms fade) and initial animate-pulse skeletons
  await page
    .waitForFunction(
      () => {
        const overlays = Array.from(document.querySelectorAll('div.fixed.inset-0'));
        const hasLoadingOverlay = overlays.some((el) => {
          if (!el.className.includes('z-[100]')) return false;
          const style = window.getComputedStyle(el);
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            Number(style.opacity) > 0
          );
        });
        if (hasLoadingOverlay) return false;

        const pulseEls = Array.from(document.querySelectorAll('.animate-pulse'));
        const hasSkeleton = pulseEls.some((el) => {
          const style = window.getComputedStyle(el);
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            Number(style.opacity) === 0
          ) {
            return false;
          }
          const rect = el.getBoundingClientRect();
          return rect.width >= 120 && rect.height >= 60;
        });
        return !hasSkeleton;
      },
      undefined,
      { timeout: 20_000 }
    )
    .catch(() => undefined);

  // Wait briefly for network/client hydration & image decoding
  await page.waitForTimeout(options?.settleMs ?? 350);

  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      imgs
        .filter((img) => {
          const style = window.getComputedStyle(img);
          const rect = img.getBoundingClientRect();
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            rect.width > 0 &&
            rect.height > 0 &&
            !img.closest('noscript')
          );
        })
        .map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, 4000);
            img.addEventListener(
              'load',
              () => {
                clearTimeout(timer);
                resolve();
              },
              { once: true }
            );
            img.addEventListener(
              'error',
              () => {
                clearTimeout(timer);
                resolve();
              },
              { once: true }
            );
          });
        })
    );
  });
}

export async function assertHealthyScreen(
  page: Page,
  options?: HealthyScreenOptions
): Promise<void> {
  await waitForScreenSettled(page, options);

  // 1. Horizontal overflow check
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    overflow.scrollWidth,
    `Horizontal overflow detected: scrollWidth=${overflow.scrollWidth} > innerWidth+1=${overflow.innerWidth + 1}`
  ).toBeLessThanOrEqual(overflow.innerWidth + 1);

  // 2. Explicit simple_click broken image guard
  await expect(page.locator('img[src="simple_click"]')).toHaveCount(0);

  // 3. All visible <img> elements must be decoded and non-broken
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs
      .filter((img) => {
        if (img.closest('noscript')) return false;
        const style = window.getComputedStyle(img);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0
        ) {
          return false;
        }
        const rect = img.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        return !img.complete || img.naturalWidth === 0;
      })
      .map((img) => ({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
      }));
  });
  expect(brokenImages, `Broken visible images found: ${JSON.stringify(brokenImages)}`).toEqual(
    []
  );

  // 4. Mobile primary CTA touch target check (>= 44px)
  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 430 && options?.primaryCtas?.length) {
    for (const cta of options.primaryCtas) {
      const count = await cta.count();
      for (let i = 0; i < count; i += 1) {
        const target = cta.nth(i);
        if (await target.isVisible()) {
          const box = await target.boundingBox();
          expect(box, 'Visible primary CTA must have a bounding box').not.toBeNull();
          if (box) {
            expect(
              box.height,
              `Mobile primary CTA height (${box.height}px) must be >= 44px`
            ).toBeGreaterThanOrEqual(44);
          }
        }
      }
    }
  }

  // 5. Optional active runtime/HTTP monitor assertion
  if (options?.monitors) {
    options.monitors.assertNoRuntimeErrors();
  }
}

export async function visitAndAssertHealthyScreen(
  page: Page,
  url: string,
  options?: HealthyScreenOptions
): Promise<void> {
  const monitors = attachScreenMonitors(page, options);
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    expect(response, `Expected HTTP response navigating to ${url}`).not.toBeNull();
    if (response) {
      expect(
        response.status(),
        `Expected HTTP status < 400 for ${url}, got ${response.status()}`
      ).toBeLessThan(400);
    }
    await assertHealthyScreen(page, options);
    monitors.assertNoRuntimeErrors();
  } finally {
    monitors.detach();
  }
}

export function assertValidPngExport(
  filePath: string,
  expectedWidth: number = 1080,
  expectedHeight: number = 1920
): void {
  const buf = fs.readFileSync(filePath);
  expect(buf.length, 'Exported PNG file must be >= 24 bytes').toBeGreaterThanOrEqual(24);

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < pngSignature.length; i += 1) {
    expect(buf[i], `Invalid PNG magic byte at index ${i}`).toBe(pngSignature[i]);
  }

  const ihdrLength = buf.readUInt32BE(8);
  expect(ihdrLength, 'PNG IHDR chunk length must be 13 bytes').toBe(13);

  const ihdrTag = buf.subarray(12, 16).toString('ascii');
  expect(ihdrTag, 'PNG must contain IHDR chunk at byte 12').toBe('IHDR');

  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  expect(width, `Expected PNG width ${expectedWidth}, got ${width}`).toBe(expectedWidth);
  expect(height, `Expected PNG height ${expectedHeight}, got ${height}`).toBe(expectedHeight);

  // Walk PNG chunks from byte 8 to verify presence of IDAT and IEND markers
  let offset = 8;
  let hasIdat = false;
  let hasIend = false;
  while (offset + 12 <= buf.length) {
    const chunkLen = buf.readUInt32BE(offset);
    const chunkType = buf.subarray(offset + 4, offset + 8).toString('ascii');
    const nextOffset = offset + 12 + chunkLen;
    expect(
      nextOffset,
      `PNG chunk ${chunkType} at offset ${offset} exceeds file length ${buf.length}`
    ).toBeLessThanOrEqual(buf.length);

    if (chunkType === 'IDAT') hasIdat = true;
    if (chunkType === 'IEND') {
      hasIend = true;
      break;
    }
    offset = nextOffset;
  }

  expect(hasIdat, 'PNG must contain at least one IDAT chunk').toBe(true);
  expect(hasIend, 'PNG must contain a terminating IEND chunk').toBe(true);
}
