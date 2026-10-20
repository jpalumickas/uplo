---
'@uplo/server': minor
---

Refuse direct uploads for attachments with `directUpload: false`.

Signed IDs now include `modelName` and `attachmentName`, and `attachSignedFile` only accepts a signed ID created for the same attachment. Signed IDs created by older versions are refused.
