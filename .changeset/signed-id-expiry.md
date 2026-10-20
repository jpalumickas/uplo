---
'@uplo/server': patch
---

Fix Signed ID expiry. `signedIdExpiresIn` was added to milliseconds instead of seconds, so Signed IDs did not expire.
