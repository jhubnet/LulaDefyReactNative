import type { Envelope, IngestDescriptor, Receipt } from '../../models/types';

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

export async function sendViaIngest(
  envelope: Envelope,
  ingest: IngestDescriptor,
): Promise<Receipt> {
  // Stub implementation: support REST_JSON only for now, others return pending
  if (ingest.transport === 'REST_JSON' && ingest.endpoint) {
    // Here we'd use fetch(ingest.endpoint, { method: 'POST', headers, body: JSON.stringify(envelope) })
    // For now return a synthetic receipt
    return {
      v: 1,
      receiptId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      statusUrl: `${ingest.endpoint}/receipts/demo`,
      state: 'pending',
      updatedAt: new Date().toISOString(),
    };
  }
  // Generic pending receipt for unsupported transports in stub
  return {
    v: 1,
    receiptId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    state: 'pending',
    updatedAt: new Date().toISOString(),
  };
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
