import type { ContentDispositionType } from '@uplo/utils'

import type { ID } from './general'
import type { Service } from './service'

/** Metadata sent by the client with a direct upload. It is not trusted. */
export interface ClientMetadata {
  [key: string]: string | number | boolean
}

export interface BlobMetadata {
  /**
   * Client metadata from the direct upload. Stored apart from other fields, so
   * it cannot override server fields like `analyzed`, `width` or `blurhash`.
   */
  client?: ClientMetadata
  [key: string]: string | number | boolean | null | ClientMetadata | undefined
}

export interface BlobStoragePathParams {
  /** Random generated key (hex string) */
  key: string
  /** Lowercase file extension without the dot (e.g. `png`), if it could be detected */
  extension?: string
  /** Original file name */
  fileName: string
  /** File content type */
  contentType: string
  /** Name of the service the file is stored in */
  serviceName: string
  /** Model name from attachments config (e.g. `user`) */
  modelName: string
  /** Attachment name from attachments config (e.g. `avatar`) */
  attachmentName: string
}

/**
 * Returns the object key (path in the bucket) for a new blob.
 * The returned value is saved as the blob key, so changing this function
 * later does not affect files that were already uploaded.
 */
export type BlobStoragePath = (params: BlobStoragePathParams) => string | Promise<string>

export interface BlobData {
  id: ID
  fileName: string
  size: number | bigint
  contentType: string
  checksum: string
  key: string
  metadata: BlobMetadata
  serviceName: string
  // [property: string]: any;
}

export interface BlobUrlOptions {
  disposition?: ContentDispositionType
  expiresIn?: number
}
// export interface Blob extends Omit<BlobData, 'service'> {
export interface Blob {
  id: ID
  fileName: string
  size: number | bigint
  contentType: string
  checksum: string
  key: string
  metadata: BlobMetadata
  data: BlobData
  serviceName: string
  service: Service
  url: (opts?: BlobUrlOptions) => Promise<string>
  protocolUrl: () => Promise<string>
  updateMetadata: (metadata: BlobData['metadata']) => Promise<void>
}

export interface AttachmentData {
  id: ID
  name: string
  blobId: ID
  recordId: ID
  recordType: string
  createdAt: Date
  blob: BlobData
}

export interface Attachment extends Omit<AttachmentData, 'blob'> {
  blob: Blob
  url: Blob['url']
  protocolUrl: Blob['protocolUrl']
  metadata: Blob['metadata']
}
