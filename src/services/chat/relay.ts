import type { Ciphertext } from '../../models/types';

export async function sendCiphertext(peerId: string, msg: Ciphertext): Promise<{ ok: boolean }> {
  console.log('Relay send ->', { peerId, msg });
  return { ok: true };
}

export async function fetchCiphertexts(
  _since?: number,
): Promise<{ from: string; msg: Ciphertext }[]> {
  // TODO: poll VC5 Messaging Relay
  return [];
}
