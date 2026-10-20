---
'@uplo/fastify': minor
---

Harden direct upload route:

- Return `201` on success (status was set after sending, so it was `200`).
- Return `422` with `{ success: false, error: { message } }` for invalid requests, unknown attachments, failed attachment validation and disabled direct uploads, same as the Hono route. These were `400` or `500` before.
- Validate `attachmentName` format (`model.attachment`).
- Store client `metadata` as `blob.metadata.client`, so clients cannot set fields like `analyzed`.
