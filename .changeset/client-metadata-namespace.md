---
'@uplo/types': minor
'@uplo/server': minor
'@uplo/fastify': minor
---

Store client metadata from direct uploads as `blob.metadata.client`, so it cannot override server fields like `analyzed`, `width` or `blurhash`. Before, the Hono route dropped it. Client metadata must be a flat object of up to 20 keys with string (up to 1000 characters), number or boolean values, otherwise the route returns `422`.
