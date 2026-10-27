'use client';

import React, { useEffect, Suspense } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  captureAttributionParams,
  CONSENT_STORAGE_KEY,
  DEFAULT_META_PIXEL_ID,
} from '@/lib/analytics/tracking';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || '';
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';
const META_PIXEL_ID = DEFAULT_META_PIXEL_ID;

function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureAttributionParams();

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    if (
      typeof window !== 'undefined' &&
      typeof window.gtag === 'function' &&
      GA4_ID
    ) {
      window.gtag('config', GA4_ID, {
        page_path:
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
      });
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const applyConsentState = () => {
      try {
        const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
        // Por padrão no Brasil, assume consentimento até que o usuário recuse explicitamente
        let marketingGranted = true;
        let analyticsGranted = true;

        if (raw) {
          const prefs = JSON.parse(raw);
          if (prefs?.essential === true && prefs?.analytics === false && prefs?.marketing === false) {
            marketingGranted = false;
            analyticsGranted = false;
          }
        }

        if (typeof window.fbq === 'function') {
          window.fbq('consent', marketingGranted ? 'grant' : 'revoke');
        }

        if (typeof window.gtag === 'function') {
          window.gtag('consent', 'update', {
            ad_storage: marketingGranted ? 'granted' : 'denied',
            ad_user_data: marketingGranted ? 'granted' : 'denied',
            ad_personalization: marketingGranted ? 'granted' : 'denied',
            analytics_storage: analyticsGranted ? 'granted' : 'denied',
          });
        }
      } catch {
        // Ignora erro de storage
      }
    };

    applyConsentState();
    window.addEventListener('arenafitpro:consent-updated', applyConsentState);
    return () =>
      window.removeEventListener(
        'arenafitpro:consent-updated',
        applyConsentState
      );
  }, []);

  return null;
}

export function MarketingScripts() {
  const primaryGoogleTag = GA4_ID || GOOGLE_ADS_ID;

  return (
    <>
      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>

      {/* Meta Pixel (ArenaFitPro: 1670464094798814) */}
      {META_PIXEL_ID && (
        <>
          <Script
            id="meta-pixel-base"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 / Google Ads + Consent Mode v2 */}
      {primaryGoogleTag && (
        <>
          <Script
            id="google-gtag-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${primaryGoogleTag}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                ${GA4_ID ? `gtag('config', '${GA4_ID}', { send_page_view: true });` : ''}
                ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager (Opcional) */}
      {GTM_ID && (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      )}
    </>
  );
}
