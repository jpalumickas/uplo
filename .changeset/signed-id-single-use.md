---
'@uplo/types': minor
'@uplo/server': minor
'@uplo/adapter-prisma': minor
'@uplo/adapter-drizzle-pg': minor
---

`attachSignedFile` refuses a Signed ID that is already attached to another record with `BlobAlreadyAttachedError`, so a leaked Signed ID cannot be reused. Attaching it again to the same record and attachment returns the existing attachment.

Breaking for custom adapters: add `findBlobAttachments(blobId)` that returns all attachments of a blob.
