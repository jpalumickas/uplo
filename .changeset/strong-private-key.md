---
'@uplo/server': minor
---

Require `privateKey` to be at least 32 bytes. A short key could be guessed offline from any Signed ID and used to forge Signed IDs, so `createUplo` now throws. Generate a key with `openssl rand -base64 32`. A missing key still only fails when a direct upload is created or attached.
