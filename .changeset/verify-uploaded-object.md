---
'@uplo/types': minor
'@uplo/server': minor
'@uplo/service-s3': minor
'@uplo/service-gcs': minor
'@uplo/service-r2': patch
---

`attachSignedFile` checks the stored file before attaching a direct upload: it throws `BlobNotUploadedError` when the file does not exist and `BlobValidationError` when its size or content type differs from what was declared. Services get an optional `getObjectInfo({ key })` method (S3 and R2 use a `HEAD` request, GCS reads file metadata). Services without it skip the check.
