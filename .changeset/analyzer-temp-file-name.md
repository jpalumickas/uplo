---
'@uplo/analyzer': patch
---

Fix analyzer writing outside the temp directory when the file name contains `../`. Temp files now use a fixed name with a safe extension, and are removed when an analyzer throws.
