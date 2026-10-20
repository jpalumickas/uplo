import { UploError } from '@uplo/server'
import { createS3Service } from '@uplo/service-s3'
import type { Service, BlobData } from '@uplo/types'
import { isEdge } from '@uplo/utils'

import type { Options } from './types'
import { buildR2Endpoint } from './utils/buildR2Endpoint'
import { edgeRequestHandler } from './utils/edgeRequestHandler'

export type { R2Jurisdiction } from './types'
export { buildR2Endpoint } from './utils/buildR2Endpoint'

export const createR2Service = ({
  accountId,
  bucket,
  accessKeyId,
  secretAccessKey,
  jurisdiction,
  endpoint = buildR2Endpoint({ accountId, jurisdiction }),
  isPublic = false,
  publicUrl,
  requestHandler = isEdge ? edgeRequestHandler : undefined,
  storagePath,
}: Options): Service => {
  if (isPublic && !publicUrl) {
    throw new UploError(
      'R2 service: `publicUrl` is required when `isPublic` is true (r2.dev subdomain or custom domain)',
    )
  }

  const service = createS3Service({
    bucket,
    accessKeyId,
    secretAccessKey,
    endpoint,
    region: 'auto',
    isPublic,
    publicUrl,
    // R2 has no object ACLs; public access is configured on the bucket
    acl: false,
    // SDK default signs a CRC32 of an empty body into direct upload URLs
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    requestHandler,
    storagePath,
  })

  return {
    ...service,
    async protocolUrl(blob: BlobData) {
      return `r2://${bucket}/${blob.key}`
    },
  }
}
