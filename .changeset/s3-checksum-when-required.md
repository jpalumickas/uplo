---
'@uplo/service-s3': patch
---

Default `requestChecksumCalculation` and `responseChecksumValidation` to `WHEN_REQUIRED`. The AWS SDK default signed a CRC32 checksum of an empty body into direct upload URLs, so S3 rejected uploads.
