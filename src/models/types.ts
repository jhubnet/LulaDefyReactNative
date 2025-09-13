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
  redirectUri?: string; // optional web fallback for non-app users
  transportHint?: TransportType; // optional advisory
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
  placeholder?: string;
  helpText?: string;
  regex?: string;
  min?: number;
  max?: number;
  accept?: string[]; // for file types (MIME types)
  // mapping hint from vault key(s)
  source?: string; // e.g. "vault.identity.firstName" or JMESPath-like
}

export interface CompanySchema {
  id: string;
  companyId: string;
  title: string;
  version?: number;
  fields: SchemaField[];
}

// Ingest descriptors
export type TransportType =
  | 'REST_JSON'
  | 'PRESIGNED_UPLOAD'
  | 'SFTP_PGP'
  | 'EMAIL_SMIME'
  | 'GRAPHQL'
  | 'REST_MTLS';

export interface IngestAuthBearer {
  type: 'Bearer';
  token: string;
}

export interface IngestAuthMTLS {
  type: 'MTLS';
}

export type IngestAuth = IngestAuthBearer | IngestAuthMTLS;

export interface IngestEncryptionNone {
  type: 'NONE';
}

export interface IngestEncryptionPGP {
  type: 'PGP';
  recipients?: { fingerprint?: string; keyId?: string }[];
}

export interface IngestEncryptionSMIME {
  type: 'SMIME';
  certRefs?: { serialNumber?: string; issuer?: string }[];
}

export interface IngestEncryptionHybrid {
  type: 'HYBRID';
}

export type IngestEncryption =
  | IngestEncryptionNone
  | IngestEncryptionPGP
  | IngestEncryptionSMIME
  | IngestEncryptionHybrid;

export interface IngestDescriptor {
  transport: TransportType;
  endpoint?: string;
  headers?: Record<string, string>;
  auth?: IngestAuth;
  encryption?: IngestEncryption;
  expiresAt?: string; // ISO timestamp
}

export interface PrivacyNotice {
  version: number;
  url?: string;
  md?: string; // markdown
}

export interface ResolveResponse {
  v: number;
  company: Company;
  schema: CompanySchema;
  privacyNotice?: PrivacyNotice;
  ingest: IngestDescriptor;
}

// Envelope to send to company ingest
export interface InlineBlobAttachment {
  fieldId: string;
  fileName: string;
  contentType: string;
  size: number;
  blobB64: string | null; // may be null if presigned upload used
  uploadUrl: null;
}

export interface PresignedAttachmentRef {
  fieldId: string;
  objectKey: string;
  contentType: string;
  size: number;
  blobB64: null;
  uploadUrl?: string | null; // optional URL provided pre-upload
}

export type EnvelopeAttachment = InlineBlobAttachment | PresignedAttachmentRef;

export interface EnvelopeEncryptionNone {
  type: 'NONE';
}

export interface EnvelopeSignature {
  alg: string; // e.g., EdDSA
  pubKey: string; // base64url
  sigB64: string; // base64url
}

export interface Envelope<T = Record<string, unknown>> {
  v?: number;
  envelopeId?: string;
  companyId: string;
  schemaId: string;
  correlationId: UUID;
  createdAt?: string;
  payload: T; // mapped payload or ciphertext depending on encryption
  attachments?: EnvelopeAttachment[];
  encryption?: IngestEncryption | EnvelopeEncryptionNone;
  signature?: EnvelopeSignature | null;
  meta?: Record<string, unknown>;
}

export interface Receipt {
  v: number;
  receiptId: string;
  statusUrl?: string;
  state?: 'pending' | 'accepted' | 'rejected' | 'error';
  updatedAt?: string;
  details?: unknown;
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
