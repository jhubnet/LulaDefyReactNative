import { fetchCompany, fetchSchema } from './companyDirectory';
import { Config } from './config';
import type { DecodedJWT, LulaLinkPayload, ResolveResponse, TransportType } from '../models/types';

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

export function parseLulaLink(input: string): {
  token?: string;
  payload?: LulaLinkPayload;
  errors?: string[];
} {
  try {
    const trimmed = input.trim();
    // Case 1: Raw LULA token prefix
    if (trimmed.startsWith('LULA1.')) {
      const tok = trimmed.slice('LULA1.'.length);
      const decoded = decodeJwt<LulaLinkPayload>(tok);
      if (!decoded) return { errors: ['DECODE_FAILED'] };
      return { token: tok, payload: decoded.payload };
    }

    // Case 2: Plain JWT-looking string
    if (/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*$/.test(trimmed)) {
      const decoded = decodeJwt<LulaLinkPayload>(trimmed);
      if (!decoded) return { errors: ['DECODE_FAILED'] };
      return { token: trimmed, payload: decoded.payload };
    }

    // Case 3: URL with ?token or ?jwt
    const u = new URL(trimmed);
    const token = u.searchParams.get('token') || u.searchParams.get('jwt') || undefined;
    if (!token) return { errors: ['NO_TOKEN'] };
    const decoded = decodeJwt<LulaLinkPayload>(token);
    if (!decoded) return { errors: ['DECODE_FAILED'] };
    return { token, payload: decoded.payload };
  } catch {
    return { errors: ['URL_PARSE_FAILED'] };
  }
}

// Lightweight parser to extract company/schema from a URL without a token.
export function parseCompanySchema(input: string): {
  companyId?: string;
  schemaId?: string;
  errors?: string[];
} {
  try {
    const u = new URL(input.trim());
    const companyId = u.searchParams.get('companyId') || undefined;
    const schemaId = u.searchParams.get('schemaId') || undefined;
    if (companyId && schemaId) {
      return { companyId, schemaId };
    }
    return { errors: ['MISSING_COMPANY_OR_SCHEMA'] };
  } catch {
    return { errors: ['URL_PARSE_FAILED'] };
  }
}

export async function verifyLinkToken(_token: string): Promise<boolean> {
  // TODO: call VC3 DiscoveryLink Service for verification. For now always true.
  return true;
}

export async function resolveToken(token: string): Promise<ResolveResponse> {
  // TODO: Replace with real Vendor Resolve API call after verification.
  const decoded = decodeJwt<LulaLinkPayload>(token);
  if (!decoded) throw new Error('DECODE_FAILED');
  const { companyId, schemaId, transportHint } = decoded.payload;
  const [company, schema] = await Promise.all([fetchCompany(companyId), fetchSchema(schemaId)]);
  const transport: TransportType = transportHint ?? 'REST_JSON';
  return {
    v: 1,
    company,
    schema,
    ingest: {
      transport,
      endpoint: `${Config.vendorBaseUrl}/ingest`,
      headers: {},
      auth: { type: 'Bearer', token: 'stub_token' },
      encryption: { type: 'NONE' },
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  };
}
