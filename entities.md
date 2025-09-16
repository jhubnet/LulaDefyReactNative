
````markdown name=entities.md
# Forms Discovery & Submission – Data Contracts v0.1

We (the Lula App) define the data contracts that outside systems must follow. A QR contains a signed token, not a raw link. The app verifies the token, resolves schema + ingest configuration, renders [...]

## 0. Common

- v: integer on all top-level responses for versioning.
- IDs: stable strings (UUID/ULID).
- Encoding: UTF-8 JSON.
- Time: ISO-8601 UTC.
- Auth: Vendor APIs use OAuth2/JWT Bearer or mTLS (internal). Company ingest varies by transport.

## 1. QR Token (LULA‑JWS v1)

QR content is not a link. It is a signed compact token:

- Format: LULA1.<JWS>
- Header (examples): { "alg": "EdDSA", "typ": "lula/link+jwt", "kid": "key-2025-01" }
- Payload (claims, no PII):
  ```json
  {
    "v": 1,
    "iss": "https://vendor.example/vc3",
    "aud": "lula-app",
    "iat": 1736790000,
    "exp": 1736791800,
    "jti": "2be6b09a-83dc-4fae-8c0b-20df1e0d7d60",
    "companyId": "co_demo",
    "schemaId": "schema_onboarding_v1",
    "linkId": "lnk_abc123",
    "transportHint": "REST_JSON"
  }
  ```

Notes:
- Short TTL (e.g., 10–30 minutes) to limit replay.
- The app never opens a URL from QR; it only parses/verifies data.
- Public keys exposed via JWKs for verification.

## 2. Resolve Company + Schema + Ingest

POST (preferred) or GET (allowed) to Vendor Discovery with the token.

- POST /vendor/discovery/resolve
  ```json
  { "token": "<JWS>" }
  ```

- 200 OK
  ```json
  {
    "v": 1,
    "company": { "id": "co_demo", "name": "Demo Company", "logoUrl": "https://cdn.vendor.example/logos/co_demo.png" },
    "schema": {
      "id": "schema_onboarding_v1",
      "companyId": "co_demo",
      "title": "Onboarding",
      "version": 1,
      "fields": [
        { "id": "firstName", "label": "First Name", "type": "string", "required": true, "placeholder": "Jane", "helpText": "As per your ID", "source": "vault.identity.firstName" },
        { "id": "lastName", "label": "Last Name", "type": "string", "required": true, "source": "vault.identity.lastName" },
        { "id": "email", "label": "Email", "type": "email", "regex": "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", "source": "vault.identity.email" },
        { "id": "nationalIdFront", "label": "National ID (front)", "type": "file", "accept": ["image/jpeg","image/png"] }
      ]
    },
    "privacyNotice": { "version": 3, "url": "https://company.example/privacy" },
    "ingest": {
      "transport": "REST_JSON",
      "endpoint": "https://ingest.company.example/api/v1/lula",
      "headers": { "x-lula-ingest-key": "ephemeral_ingest_key_123" },
      "auth": { "type": "Bearer", "token": "eyJhbGciOi..." },
      "encryption": { "type": "NONE" },
      "expiresAt": "2025-09-13T14:30:00Z"
    }
  }
  ```

- 4xx/5xx errors
  ```json
  { "v": 1, "error": { "code": "TOKEN_INVALID", "message": "Link token invalid or expired", "correlationId": "corr_..." } }
  ```

## 3. Consent (Local + Optional Acknowledgment)

Local consent record (saved on device and/or posted to Vendor if required):
```json
{
  "v": 1,
  "id": "cons_01J7YBFXE6...",
  "companyId": "co_demo",
  "schemaId": "schema_onboarding_v1",
  "linkId": "lnk_abc123",
  "granted": true,
  "grantedAt": "2025-09-13T11:05:00Z",
  "scopes": ["form:onboarding:submit"]
}
```

Optional acknowledge:
- POST /vendor/consent/ack
  ```json
  { "v": 1, "consentId": "cons_...", "linkId": "lnk_...", "granted": true }
  ```

## 4. Envelope (Submission Payload)

```json
{
  "v": 1,
  "envelopeId": "env_01J7YBK0GQ",
  "companyId": "co_demo",
  "schemaId": "schema_onboarding_v1",
  "correlationId": "corr_01J7YBN3S4",
  "createdAt": "2025-09-13T11:06:30Z",
  "meta": { "appVersion": "1.0.0", "device": "ios", "linkId": "lnk_abc123" },
  "payload": { "firstName": "Jane", "lastName": "Doe", "email": "jane.doe@example.com", "nationalIdFront": null },
  "attachments": [
    {
      "fieldId": "nationalIdFront",
      "fileName": "id-front.jpg",
      "contentType": "image/jpeg",
      "size": 245678,
      "blobB64": null,
      "uploadUrl": null
    }
  ],
  "encryption": { "type": "NONE" },
  "signature": null
}
```

Attachments:
- Inline small files via blobB64
- Or presigned upload flow:
  ```json
  { "fieldId":"nationalIdFront","objectKey":"co_demo/env_01J7.../id-front.jpg","contentType":"image/jpeg","size":245678 }
  ```

## 5. Transports

- REST_JSON
  - POST {ingest.endpoint}
  - Headers: ingest.headers + Authorization (if auth.type=Bearer)
  - Body: Envelope
  - 202 Response:
    ```json
    { "v": 1, "receiptId": "rcpt_01J7YBQ2VN...", "statusUrl": "https://ingest.company.example/api/v1/receipts/rcpt_..." }
    ```

- PRESIGNED_UPLOAD
  - Upload files first via provided URL/key; submit Envelope referencing objectKey.

- SFTP_PGP
  - PGP-encrypted file(s) delivered via SFTP; optional manifest POST to record receipt.

- EMAIL_SMIME
  - S/MIME attachment to designated mailbox; Vendor relay may track delivery.

- GRAPHQL
  - Mutation endpoint; Envelope mapped to GraphQL input.

- REST_MTLS
  - Same as REST_JSON with client cert auth.

## 6. Receipt & Status

- statusUrl (if provided) returns:
  ```json
  { "v": 1, "receiptId":"rcpt_...", "state":"accepted", "updatedAt":"2025-09-13T11:07:10Z", "details": null }
  ```
- state ∈ "pending" | "accepted" | "rejected" | "error"

## 7. Errors (Unified)

```json
{ "v": 1, "error": { "code": "SOME_CODE", "message": "Human readable", "correlationId": "corr_..." } }
```

Common codes: TOKEN_INVALID, TOKEN_EXPIRED, COMPANY_NOT_FOUND, SCHEMA_NOT_FOUND, INGEST_UNAVAILABLE, INGEST_UNAUTHORIZED, PAYLOAD_INVALID, ATTACHMENT_TOO_LARGE.

## 8. Security Notes

- QR uses signed token LULA1.<JWS>. No URLs are auto-opened.
- No secrets in QR; ingest config is resolved after verification.
- Revocation via jti blacklist and key rotation.
- Optional encryption/signature:
  - PGP: recipients (fingerprint/keyId)
  - S/MIME: cert references
  - HYBRID: scheme with ephemeral public key and AAD over envelope meta
  - Signature (optional): { alg, pubKey, sigB64 }

## 9. Versioning

- All objects include v.
- Additive changes are non-breaking; breaking changes bump version.

## 10. Integration Setup & Token Minting (Portal Flow)

1) Company selects schema(s) and transport blueprint in the portal, creating an integrationId.
2) Portal provides:
   - API credentials for minting tokens (server-to-server).
   - JWKs URL for public keys.
   - Code snippets to render QR with short‑lived tokens.
3) Company adds a server endpoint that calls:
   - POST /vendor/links/mint → returns { token, linkId, expiresAt }
   - The form page fetches /lula/token, then renders a QR of LULA1.<JWS>.
4) (Optional) Batch mint for printed/static forms with limited TTL.

Example mint request:
```json
{ "integrationId": "int_123", "schemaId": "schema_onboarding_v1", "ttlSeconds": 1800, "context": { "campaignId": "Q3" } }
```

Example mint response:
```json
{ "v": 1, "token": "<JWS>", "linkId": "lnk_abc123", "expiresAt": "2025-09-13T14:30:00Z" }
```

