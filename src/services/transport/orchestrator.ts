import type { Envelope } from '../../models/types';

export type TransportType =
  | 'REST_JSON'
  | 'PRESIGNED_UPLOAD'
  | 'SFTP_PGP'
  | 'EMAIL_SMIME'
  | 'GRAPHQL'
  | 'REST_MTLS';

export interface SendResult {
  ok: boolean;
  receiptId?: string;
  error?: string;
}

export async function sendEnvelope(
  envelope: Envelope,
  transport: TransportType,
  endpointUrl: string,
): Promise<SendResult> {
  // TODO: implement each transport properly. For now, pretend success and return a synthetic receipt.
  console.log('Sending envelope', { transport, endpointUrl, envelope });
  return {
    ok: true,
    receiptId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  };
}

export async function queueAndRetry(
  task: () => Promise<SendResult>,
  retries = 3,
): Promise<SendResult> {
  let last: SendResult = { ok: false };
  for (let i = 0; i < retries; i++) {
    try {
      const res = await task();
      if (res.ok) return res;
      last = res;
    } catch (e: any) {
      last = { ok: false, error: e?.message ?? 'unknown' };
    }
    await new Promise((r) => setTimeout(r, 300 * (i + 1)));
  }
  return last;
}
