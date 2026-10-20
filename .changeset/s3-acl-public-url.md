---
'@uplo/service-s3': minor
'@uplo/utils': patch
---

Add `acl` option (default `true`) to skip object ACLs for providers without ACL support, `publicUrl` option for a custom public base URL, and pass-through `requestChecksumCalculation` / `responseChecksumValidation` options. Export runtime helpers (`isEdge`, `isNode`, `isDeno`) from `@uplo/utils`.
