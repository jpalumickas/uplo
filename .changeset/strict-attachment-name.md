---
'@uplo/server': patch
---

Only accept attachment names defined in config. Names like `user.avatar.validate` or `user.constructor` were matched before and skipped attachment validation.
