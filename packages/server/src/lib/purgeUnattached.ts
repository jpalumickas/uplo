import type { Adapter, BlobData, ID, Service } from '@uplo/types'

import { PurgeNotSupportedError, UploError } from '../errors'
import { parseDuration, type Duration } from './parseDuration'
import { purgeBlob } from './purgeBlob'

export interface PurgeUnattachedOptions {
  /** Only blobs created before this. Default `'1d'`. Must be at least `signedIdExpiresIn`. */
  olderThan?: Duration | Date
  /** Blobs loaded per query. Default `100`. */
  batchSize?: number
  /** Stop after this time and return `hasMore: true`. No limit by default. */
  maxDuration?: Duration
  /** Only return the blobs that would be purged */
  dryRun?: boolean
}

export interface PurgeUnattachedResult {
  /** Purged blobs, or with `dryRun` the blobs that would be purged */
  blobs: BlobData[]
  /** Blobs that failed to purge. They are tried again on the next run. */
  errors: { blob: BlobData; error: unknown }[]
  /** `maxDuration` was reached before all blobs were checked */
  hasMore: boolean
}

export const purgeUnattached = async ({
  options = {},
  adapter,
  services,
  signedIdExpiresIn,
}: {
  options?: PurgeUnattachedOptions
  adapter: Adapter
  services: Record<string, Service>
  signedIdExpiresIn: number
}): Promise<PurgeUnattachedResult> => {
  const { olderThan = '1d', batchSize = 100, maxDuration, dryRun = false } = options

  if (!adapter.findUnattachedBlobs || !adapter.deleteUnattachedBlob) {
    throw new PurgeNotSupportedError(
      'Adapter does not support purge (findUnattachedBlobs, deleteUnattachedBlob)',
    )
  }

  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new UploError(`Invalid batchSize: ${batchSize}`)
  }

  const startedAt = Date.now()
  const cutoff =
    olderThan instanceof Date ? olderThan : new Date(startedAt - parseDuration(olderThan))

  // A blob with a valid signed ID can still be attached, so never touch it
  const latestAllowed = startedAt - signedIdExpiresIn * 1000
  if (cutoff.getTime() > latestAllowed) {
    throw new UploError(
      `olderThan must be at least signedIdExpiresIn (${signedIdExpiresIn}s), so blobs with a valid signed ID are not purged`,
    )
  }

  const deadline = maxDuration === undefined ? Infinity : startedAt + parseDuration(maxDuration)
  const result: PurgeUnattachedResult = { blobs: [], errors: [], hasMore: false }
  let afterId: ID | undefined

  while (true) {
    const batch = await adapter.findUnattachedBlobs({
      olderThan: cutoff,
      limit: batchSize,
      afterId,
    })

    for (const blob of batch) {
      if (Date.now() >= deadline) {
        result.hasMore = true
        return result
      }

      if (dryRun) {
        result.blobs.push(blob)
        continue
      }

      try {
        const service = services[blob.serviceName]
        if (!service) {
          throw new UploError(`Cannot find service with name ${blob.serviceName}`)
        }

        if (await purgeBlob({ blob, adapter, service })) {
          result.blobs.push(blob)
        }
      } catch (error) {
        result.errors.push({ blob, error })
      }
    }

    if (batch.length < batchSize) {
      return result
    }

    // Failed blobs stay unattached, so continue after the last one instead of
    // loading the same batch again
    afterId = batch[batch.length - 1]!.id
  }
}
