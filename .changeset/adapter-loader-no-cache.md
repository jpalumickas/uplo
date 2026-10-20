---
'@uplo/adapter-prisma': patch
'@uplo/adapter-drizzle-pg': patch
---

Disable DataLoader cache in adapters. Loaders live as long as the adapter, so the cache grew with every lookup and `findBlob` returned stale data (e.g. metadata after analyze). Loads in the same tick are still batched.
