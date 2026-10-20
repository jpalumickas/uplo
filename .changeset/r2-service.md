---
'@uplo/service-r2': minor
---

Add Cloudflare R2 service. Builds the endpoint from `accountId` (optional `jurisdiction`), uses `auto` region, skips object ACLs, serves public files from `publicUrl`, disables SDK default checksums on direct upload URLs and applies the Workers fetch fix automatically.
