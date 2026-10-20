---
'@uplo/types': minor
'@uplo/server': minor
'@uplo/adapter-prisma': minor
'@uplo/adapter-drizzle-pg': minor
---

`detach(attachmentId)` only deletes an attachment of the same record and attachment name, and throws `AttachmentNotFoundError` otherwise. Before, it deleted any attachment by ID.

Breaking for custom adapters: `deleteAttachment(id)` is now `deleteAttachment({ id, recordId, recordType, name })` and must return `null` when nothing matched.
