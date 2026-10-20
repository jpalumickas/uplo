---
'@uplo/service-s3': patch
'@uplo/service-r2': patch
---

Sign `Content-Type` into S3 and R2 direct upload URLs, so a client cannot upload with a different content type than the validated one. Clients must send the `Content-Type` from direct upload `headers` (the Uplo React and React Native clients already do).
