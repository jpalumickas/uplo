import type { S3ServiceOptions } from '@uplo/service-s3'
import type { BlobStoragePath } from '@uplo/types'

export type R2Jurisdiction = 'eu' | 'fedramp'

export interface Options {
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
