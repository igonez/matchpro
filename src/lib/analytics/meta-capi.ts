import crypto from 'crypto';

const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '1670464094798814';
const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || '';
const META_GRAPH_VERSION = 'v21.0';

function sha256Hash(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function normalizePhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return sha256Hash(withCountry);
}

export interface MetaCapiEventInput {
  eventName:
    | 'Purchase'
    | 'Subscribe'
    | 'Lead'
    | 'CompleteRegistration'
    | 'InitiateCheckout';
  eventId: string;
  eventSourceUrl?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  user?: {
    email?: string | null;
    phone?: string | null;
    externalId?: string | null;
    clientIpAddress?: string | null;
    clientUserAgent?: string | null;
    fbp?: string | null;
    fbc?: string | null;
  };
}

/**
 * Envia evento Server-Side para a Meta Conversions API (CAPI).
 * Indispensável para atribuir pagamentos via Pix D+0 no Asaas que ocorrem fora do navegador.
 */
export async function sendMetaConversionEvent(
  input: MetaCapiEventInput
): Promise<{ sent: boolean; reason?: string }> {
  if (!META_CAPI_ACCESS_TOKEN || !META_PIXEL_ID) {
    return { sent: false, reason: 'META_CAPI_ACCESS_TOKEN not configured' };
  }

  try {
    const userData: Record<string, any> = {
      country: [sha256Hash('br')],
    };

    const em = sha256Hash(input.user?.email);
    const ph = normalizePhone(input.user?.phone);
    const externalId = sha256Hash(input.user?.externalId);

    if (em) userData.em = [em];
    if (ph) userData.ph = [ph];
    if (externalId) userData.external_id = [externalId];
    if (input.user?.clientIpAddress) {
      userData.client_ip_address = input.user.clientIpAddress;
    }
    if (input.user?.clientUserAgent) {
      userData.client_user_agent = input.user.clientUserAgent;
    }
    if (input.user?.fbp) userData.fbp = input.user.fbp;
    if (input.user?.fbc) userData.fbc = input.user.fbc;

    const payload = {
      data: [
        {
          event_name: input.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.eventId,
          action_source: 'website',
          event_source_url:
            input.eventSourceUrl || 'https://arenafitpro.com.br',
          user_data: userData,
          custom_data: {
            currency: input.currency || 'BRL',
            ...(typeof input.value === 'number' ? { value: input.value } : {}),
            ...(input.contentName ? { content_name: input.contentName } : {}),
            ...(input.contentCategory
              ? { content_category: input.contentCategory }
              : {}),
          },
        },
      ],
      ...(process.env.META_CAPI_TEST_EVENT_CODE
        ? { test_event_code: process.env.META_CAPI_TEST_EVENT_CODE }
        : {}),
    };

    const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(
      META_CAPI_ACCESS_TOKEN
    )}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.warn('[Meta CAPI] Aviso ao enviar evento:', res.status, errBody);
      return { sent: false, reason: `HTTP ${res.status}` };
    }

    return { sent: true };
  } catch (err: any) {
    console.warn('[Meta CAPI] Falha de rede ao enviar evento:', err?.message);
    return { sent: false, reason: err?.message };
  }
}
