---
'@uplo/types': minor
'@uplo/server': minor
'@uplo/adapter-prisma': minor
'@uplo/adapter-drizzle-pg': minor
---

Purge APIs to delete files from storage:

- `uplo.purgeUnattached({ olderThan, batchSize, maxDuration, dryRun })` deletes blobs without attachments (never attached direct uploads, detached and replaced files), for a cron job. `olderThan` defaults to `'1d'` and must be at least `signedIdExpiresIn`.
- `blob.purge()` deletes one blob and its file when nothing is attached to it.
- `detach({ purge: true })`, `detach(id, { purge: true })` and `detachMany({ purge: true })` also delete the detached blobs.

Purge deletes the file first and the blob row last, so a failed purge can be run again. Detach still keeps files by default.

Adapters get optional `findUnattachedBlobs` and `deleteUnattachedBlob` methods. Custom adapters without them keep working, purge throws `PurgeNotSupportedError`.
