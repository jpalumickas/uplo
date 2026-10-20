---
'@uplo/adapter-prisma': patch
---

`deleteAttachments` returns the deleted attachments, as the adapter interface describes. Before, it returned Prisma's `{ count }`.
