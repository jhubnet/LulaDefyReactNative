// Domain model types for Lula Vault + Chat

export type UUID = string;

// LulaLink JWT payload (decoded)
export interface LulaLinkPayload {
  iss: string; // issuer (VC3 DiscoveryLink Service)
  aud: string; // audience (lula app)
  iat: number;
  exp: number;
  jti: UUID;
  companyId: string;
  schemaId: string;
  linkId?: string;
  redirectUri?: string; // optional web fallback
}

export interface DecodedJWT<TPayload = unknown> {
  header: Record<string, unknown>;
  payload: TPayload;
  signatureB64Url: string;
  raw: string;
}

// Company directory
export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
}

export type FieldType =
  | 'string'
  | 'number'
  | 'date'
  | 'email'
  | 'phone'
  | 'boolean'
  | 'file'
  | 'json';

export interface SchemaField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  // mapping hint from vault key(s)
  source?: string; // e.g. "vault.identity.firstName" or JMESPath-like
}

export interface CompanySchema {
  id: string;
  companyId: string;
  title: string;
  fields: SchemaField[];
}

// Envelope to send to company ingest
export interface Envelope<T = Record<string, unknown>> {
  companyId: string;
  schemaId: string;
  correlationId: UUID;
  payload: T; // mapped and optionally encrypted blobs
  meta?: Record<string, unknown>;
}

// Chat types
export interface IdentityKeyPair {
  // public keys are safe to publish; private MUST live only on device vault
  identityPublicKey: string; // base64url(X25519 or Ed25519)
  identityPrivateKeyRef: string; // vault reference to private key
}

export interface PreKeyBundle {
  registrationId: number;
  deviceId: string;
  identityKey: string; // base64url
  signedPreKey: {
    keyId: number;
    publicKey: string; // base64url
    signature: string; // base64url
  };
  oneTimePreKeys: { keyId: number; publicKey: string }[];
}

export interface Ciphertext {
  type: 'prekey' | 'message';
  bodyB64: string; // base64 encoded ciphertext
}

export interface ChatMessage {
  id: UUID;
  peerId: string; // phone number or directory id
  fromSelf: boolean;
  timestamp: number;
  plaintext?: string; // for local display after decrypt
  ciphertext?: Ciphertext; // stored for outbox/inbox
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'error';
}
