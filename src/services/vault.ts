// Temporary in-memory vault. TODO: replace with secure storage and on-device encryption.

const memoryVault: Record<string, any> = {
  identity: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
  },
  keys: {},
};

export function get(path: string): any {
  if (!path) return undefined;
  const parts = path.split('.');
  let cur: any = memoryVault;
  for (const key of parts) {
    if (cur == null || !(key in cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

export function set(path: string, value: any): void {
  if (!path) return;
  const parts = path.split('.');
  let cur: any = memoryVault;
  for (const key of parts.slice(0, -1)) {
    if (cur[key] == null) cur[key] = {};
    cur = cur[key];
  }
  const lastKey = parts[parts.length - 1];
  if (lastKey === undefined) return;
  cur[lastKey] = value;
}

export function getIdentitySnapshot() {
  return { ...memoryVault.identity };
}
