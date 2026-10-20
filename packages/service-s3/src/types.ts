import type { S3ClientConfig } from '@aws-sdk/client-s3'

import type { BlobStoragePath } from '@uplo/types'

export interface Options {
  isPublic?: boolean
  bucket: string
  region?: S3ClientConfig['region']
  accessKeyId: string
  secretAccessKey: string
  endpoint?: S3ClientConfig['endpoint']
  forcePathStyle?: S3ClientConfig['forcePathStyle']
  requestHandler?: S3ClientConfig['requestHandler']
  /**
   * AWS SDK default (`WHEN_SUPPORTED`) signs a CRC32 of an empty body into
   * direct upload URLs, so uploads with a real body fail.
   * @default 'WHEN_REQUIRED'
   */
  requestChecksumCalculation?: S3ClientConfig['requestChecksumCalculation']
  /** @default 'WHEN_REQUIRED' */
  responseChecksumValidation?: S3ClientConfig['responseChecksumValidation']
  /** Send object ACL on uploads. Set `false` for providers without ACL support (e.g. Cloudflare R2). */
  acl?: boolean
  /** Base URL for public objects (e.g. CDN or custom domain). Used by `publicUrl()` as `${publicUrl}/${key}`. */
  publicUrl?: string
  /** Default path in the bucket for new files. Attachment `storagePath` takes priority. */
  storagePath?: BlobStoragePath
}
