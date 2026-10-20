---
'@uplo/react': minor
'@uplo/react-native': minor
---

Add `headers` and `credentials` options to `UploProvider` for requests to your API, e.g. to send an `Authorization` token to an authenticated upload route. `headers` can be an object or a function (can be async) that runs before each request. They are not sent to the storage provider.
