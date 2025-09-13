import type { LulaLinkPayload, DecodedJWT } from '../models/types';

function base64UrlToString(input?: string): string | null {
  if (!input) return null;
  try {
    const pad = (s: string) => s + '='.repeat((4 - (s.length % 4)) % 4);
    const b64 = pad(input.replace(/-/g, '+').replace(/_/g, '/'));
    if (typeof atob === 'function') {
      // atob handles base64 to binary string; assume UTF-8 content is ASCII-safe here for stub
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(b64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
    }
  } catch {}
  return null;
}

export function decodeJwt<TPayload = unknown>(token: string): DecodedJWT<TPayload> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const [h, p, s] = parts;
  const headerStr = base64UrlToString(h);
  const payloadStr = base64UrlToString(p);
  try {
    return {
      header: headerStr ? JSON.parse(headerStr) : {},
      payload: payloadStr ? (JSON.parse(payloadStr) as TPayload) : ({} as TPayload),
      signatureB64Url: s ?? '',
      raw: token,
    };
  } catch {
    return null;
  }
}

export function parseLulaLink(url: string): {
  token?: string;
  payload?: LulaLinkPayload;
  errors?: string[];
} {
  try {
    const u = new URL(url);
    const token = u.searchParams.get('token') || u.searchParams.get('jwt') || undefined;
    if (!token) return { errors: ['NO_TOKEN'] };
    const decoded = decodeJwt<LulaLinkPayload>(token);
    if (!decoded) return { errors: ['DECODE_FAILED'] };
    return { token, payload: decoded.payload };
  } catch {
    return { errors: ['URL_PARSE_FAILED'] };
  }
}

export async function verifyLinkToken(_token: string): Promise<boolean> {
  // TODO: call VC3 DiscoveryLink Service for verification. For now always true.
  return true;
}
