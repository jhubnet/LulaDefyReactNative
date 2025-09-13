import type { Ciphertext } from '../../models/types';

export interface Session {
  id: string;
  peerId: string;
  // TODO: store ratchet state here
}

export function startSessionX3DH(peerId: string): Session {
  // TODO: perform real X3DH using peer's prekey bundle
  return { id: `sess_${Date.now()}`, peerId };
}

export function encrypt(_session: Session, plaintext: string): Ciphertext {
  // TODO: replace with Double Ratchet encrypt
  return { type: 'message', bodyB64: `ENC(${plaintext})` };
}

export function decrypt(_session: Session, ciphertext: Ciphertext): string {
  // TODO: replace with Double Ratchet decrypt
  const m = ciphertext.bodyB64.match(/^ENC\((.*)\)$/);
  return m?.[1] ?? '[decryption error]';
}
