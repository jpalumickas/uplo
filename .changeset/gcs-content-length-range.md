---
'@uplo/service-gcs': minor
---

Add `enforceContentLength` option (default `false`) to refuse GCS direct uploads with a different file size than declared. Requires `x-goog-content-length-range` in bucket CORS `responseHeader`.
