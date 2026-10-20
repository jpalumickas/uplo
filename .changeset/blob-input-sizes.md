---
'@uplo/server': patch
'@uplo/node': patch
---

Fix blob inputs:

- `blobFileInput` returned an already read stream as `content`, so `attachFile` uploaded an empty body. It now returns a new stream.
- `blobFileInput` used the symlink size instead of the target file size.
- `blobStringInput` used string length instead of UTF-8 byte size, so non-ASCII content had a wrong size.
