# lula-defy
# Definition of Terms

| **Term** | **Definition** |
|----------|----------------|
| **Edge device** | User’s phone or tablet running the app; holds personal data in an encrypted vault and executes sends. |
| **Mapping engine** | Translator that converts Lula’s canonical field IDs into each company’s expected schema so one profile powers many forms. |
| **Transport orchestrator** | Traffic controller that selects the right send path (REST, upload, SFTP, email, GraphQL), handles retries, and tracks receipts. |
| **Package manager** | On-device bundler that builds the submission envelope, applies signatures and encryption, and prepares it for delivery. |
| **Vendor (Lula’s) Cloud (control plane)** | Metadata-only service hosting schemas, mappings, endpoints, and keys—no end-user data at rest. |
| **Company Directory** | Catalog of each partner’s requirements, endpoints, auth modes, and keys the app can discover and cache. |
| **Discovery API** | Read-only interface the app calls to fetch company records, rules, and capabilities. |
| **Schema Registry** | Versioned store for JSON Schemas that define allowed fields and validation rules. |
| **Canonical field IDs** | Stable names for common info (e.g., contact.email) used across all companies. |
| **Field bundle** | Predefined set of fields for a purpose such as KYC, employment, or education. |
| **Validation rules** | Checks that keep inputs clean—formats, ranges, enums, and required flags. |
| **Required fields** | Minimum set a company needs before it accepts a submission. |
| **Field minimization** | Only the fields a company approved leave the device; everything else stays local. |
| **Consent UX** | Screens where the user approves scope and purpose for a specific company. |
| **Consent ledger** | Tamper-evident record on the device that logs who, what, and when for each consent. |
| **Local vault** | Encrypted storage on the device; keys anchored in Secure Enclave or Android Keystore. |
| **Submission envelope** | Sealed package carrying mapped data plus metadata such as schema version and idempotency key. |
| **Idempotency key** | Unique token that enables safe retries without creating duplicate submissions. |
| **JWS (JSON Web Signature)** | Digital signature proving the envelope came from the app and remained unchanged. |
| **JWE (JSON Web Encryption)** | Encryption that locks the payload so only the target company can read it. |
| **mTLS (mutual TLS)** | Two-way certificate check that proves both client and server are trusted. |
| **Certificate pinning** | Extra TLS control that accepts only a known certificate or public key. |
| **OAuth2 PKCE** | Mobile-safe token flow granting a short-lived access token for the submission call. |
| **JWK Set** | Published list of public keys a company exposes for signatures and encryption. |
| **PGP / S-MIME** | Encryption standards used for email or file-based submissions. |
| **Pre-signed upload** | One-time URL that lets the app upload an envelope straight into a company bucket. |
| **SFTP ingest** | Secure file drop for batch pipelines, often paired with PGP encryption. |
| **GraphQL mutation** | Typed API call that writes a submission in a single request. |
| **Company ingest endpoint** | Address that accepts envelopes through the chosen transport. |
| **Status / receipt API** | Endpoint returning acceptance, processing state, and reference IDs. |
| **Store-and-forward queue** | On-device outbox that holds submissions during poor connectivity and releases them once online. |
| **Retry policy** | Automated backoff rules that recover from transient errors. |
| **Health check** | Scheduled validation confirming endpoints, keys, and TLS settings still pass muster. |
| **Versioning / deprecation window** | Controls for rolling out new schemas and sunsetting old ones without breakage. |
| **Mapping hash** | Fingerprint of the mapping used, helpful for audits and troubleshooting. |
| **Attachments** | Extra files such as images or PDFs that travel with the envelope. |
| **Partial update** | Ability to send only changed fields instead of a full form set. |
| **Device attestation** | Signal that the app runs on a genuine, untampered device. |
| **Consent token** | Compact, signed proof that the user authorized a specific scope for a specific company. |
| **Receipt store** | Local log of acknowledgements from companies for user transparency. |
| **Status UI** | Screen that shows progress, receipts, and next actions. |
| **Cert pins** | Configured values used for certificate pinning. |
| **Rate-limit policy** | Limits that control how frequently the app can call a given endpoint. |
