---
'@uplo/server': minor
---

Add `validate.custom` to attachments. It runs after the `contentType` and `size` checks for direct uploads and `attachFile`, and refuses the file with `BlobValidationError` when it returns an error message. Validation now runs before the storage key is built, so `storagePath` is not called for refused files.
