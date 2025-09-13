import type { CompanySchema, Envelope } from '../models/types';

function getByPath(obj: unknown, path?: string): unknown {
  if (!obj || !path) return undefined;
  return path
    .split('.')
    .reduce<unknown>((acc: any, key) => (acc ? acc[key] : undefined), obj as any);
}

export function mapVaultToEnvelope(
  schema: CompanySchema,
  vault: Record<string, unknown>,
): Envelope<Record<string, unknown>> {
  const mapped: Record<string, unknown> = {};
  for (const f of schema.fields) {
    const value = getByPath(vault, f.source);
    mapped[f.id] = value ?? null;
  }
  return {
    companyId: schema.companyId,
    schemaId: schema.id,
    correlationId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    payload: mapped,
  };
}
