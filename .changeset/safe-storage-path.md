---
'@uplo/server': patch
'@uplo/service-s3': patch
'@uplo/service-r2': patch
---

Make object keys safe in public URLs:

- `storagePath` results with empty, `.` or `..` segments throw.
- S3 and R2 `publicUrl` encode each key segment, so `?`, `#` and spaces stay part of the key, and throw for keys with `.` or `..` segments instead of returning a URL to another object.
