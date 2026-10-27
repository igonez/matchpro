'use client';

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
  fbp?: string;
  fbc?: string;
  landing_page?: string;
  referrer?: string;
  captured_at?: string;
}

export const ATTRIBUTION_STORAGE_KEY = 'arenafitpro_attribution_v1';
export const CONSENT_STORAGE_KEY = 'arenafitpro_cookie_consent_v1';
export const DEFAULT_META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '1670464094798814';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * Captura UTMs e Click IDs (fbclid, gclid, ttclid) da URL atual e persiste em localStorage.
 */
export function captureAttributionParams(): AttributionData | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const existingRaw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    const existing: AttributionData = existingRaw ? JSON.parse(existingRaw) : {};

    const utmKeys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'fbclid',
      'gclid',
      'ttclid',
    ] as const;

    let hasNewParams = false;
    const updated: AttributionData = { ...existing };

    for (const key of utmKeys) {
      const val = params.get(key);
      if (val) {
        updated[key] = val;
        hasNewParams = true;
      }
    }

    const fbp = getCookie('_fbp');
    const fbc =
      getCookie('_fbc') ||
      (updated.fbclid ? `fb.1.${Date.now()}.${updated.fbclid}` : undefined);

    if (fbp) updated.fbp = fbp;
    if (fbc) updated.fbc = fbc;

    if (!updated.landing_page) {
      updated.landing_page = window.location.pathname + window.location.search;
    }
    if (!updated.referrer && document.referrer) {
      updated.referrer = document.referrer;
    }
    if (hasNewParams || !updated.captured_at) {
      updated.captured_at = new Date().toISOString();
    }

    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

export function getStoredAttribution(): AttributionData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Dispara eventos padronizados para Meta Pixel e Google Analytics 4 / Google Ads.
 */
export function trackMarketingEvent(
  eventName:
    | 'PageView'
    | 'ViewContent'
    | 'Lead'
    | 'CompleteRegistration'
    | 'InitiateCheckout'
    | 'Subscribe'
    | 'Purchase',
  params?: Record<string, any>,
  eventId?: string
) {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.fbq === 'function') {
      if (eventId) {
        window.fbq('track', eventName, params || {}, { eventID: eventId });
      } else {
        window.fbq('track', eventName, params || {});
      }
    }

    if (typeof window.gtag === 'function') {
      const gaEventMap: Record<string, string> = {
        PageView: 'page_view',
        ViewContent: 'view_item',
        Lead: 'generate_lead',
        CompleteRegistration: 'sign_up',
        InitiateCheckout: 'begin_checkout',
        Subscribe: 'subscribe',
        Purchase: 'purchase',
      };
      window.gtag('event', gaEventMap[eventName] || eventName, {
        ...params,
        ...(eventId ? { transaction_id: eventId } : {}),
      });
    }
  } catch {
    // Falha silenciosa caso AdBlocker bloqueie o script
  }
}
