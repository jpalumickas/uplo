import type { Adapter, BlobData, Service } from '@uplo/types'

import { BlobPurgeConflictError, PurgeNotSupportedError } from '../errors'

type PurgeAdapter = Adapter & Required<Pick<Adapter, 'deleteUnattachedBlob'>>

export function assertPurgeSupported(adapter: Adapter): asserts adapter is PurgeAdapter {
  if (!adapter.deleteUnattachedBlob) {
    throw new PurgeNotSupportedError('Adapter does not support purge (deleteUnattachedBlob)')
  }
}

/**
 * Deletes the file first and the row last, so a failed step leaves a row that
 * the next purge can find again. Not atomic: a blob attached between the checks
 * throws `BlobPurgeConflictError`.
 */
export const purgeBlob = async ({
  blob,
  adapter,
  service,
}: {
  blob: BlobData
  adapter: Adapter
  service: Service
}) => {
  assertPurgeSupported(adapter)

  const attachments = await adapter.findBlobAttachments(blob.id)
  if (attachments.length > 0) {
    return false
  }

  await service.delete({ key: blob.key })

  const deleted = await adapter.deleteUnattachedBlob(blob.id)
  if (deleted) {
    return true
  }

  // Nothing deleted: another purge removed the row, or the blob was attached
  // after the check above and its file is gone now
  const attachedNow = await adapter.findBlobAttachments(blob.id)
  if (attachedNow.length > 0) {
    throw new BlobPurgeConflictError(
      `Blob ${blob.id} was attached while it was purged, its file is deleted`,
    )
  }

  return false
}
