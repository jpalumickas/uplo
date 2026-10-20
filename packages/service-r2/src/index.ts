import { UploError } from '@uplo/server'
import { createS3Service } from '@uplo/service-s3'
import type { Service, BlobData, BlobStoragePath } from '@uplo/types'
import { isEdge } from '@uplo/utils'

type S3ServiceOptions = Parameters<typeof createS3Service>[0]

export type R2Jurisdiction = 'eu' | 'fedramp'

interface Options {
  /** Cloudflare account ID, used to build the R2 endpoint. */
  accountId: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  /** Bucket jurisdiction, if the bucket was created with one. */
  jurisdiction?: R2Jurisdiction
  /** Full S3 API endpoint. Overrides `accountId` and `jurisdiction`. */
  endpoint?: string
  isPublic?: boolean
  /** Public bucket URL (r2.dev subdomain or custom domain). Required when `isPublic` is `true`. */
  publicUrl?: string
  requestHandler?: S3ServiceOptions['requestHandler']
  /** Default path in the bucket for new files. Attachment `storagePath` takes priority. */
  storagePath?: BlobStoragePath
}

// Workers' fetch rejects the `cache` option the AWS SDK sets
const edgeRequestHandler = {
  requestInit(_httpRequest: unknown) {
    return { cache: undefined }
  },
} as S3ServiceOptions['requestHandler']

export const buildR2Endpoint = ({
  accountId,
  jurisdiction,
}: Pick<Options, 'accountId' | 'jurisdiction'>) =>
  `https://${accountId}${jurisdiction ? `.${jurisdiction}` : ''}.r2.cloudflarestorage.com`

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
