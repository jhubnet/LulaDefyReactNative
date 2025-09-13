import type { IdentityKeyPair } from '../../models/types';
import { set, get } from '../vault';

function randomB64Url(len = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function getOrCreateIdentity(): IdentityKeyPair {
  const existing = get('keys.identity');
  if (existing) return existing as IdentityKeyPair;
  const pair: IdentityKeyPair = {
    identityPublicKey: randomB64Url(43),
    identityPrivateKeyRef: 'vault://keys/identity/private',
  };
  set('keys.identity', pair);
  return pair;
}
