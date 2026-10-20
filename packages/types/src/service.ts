import type { ReadStream as FsReadStream } from 'node:fs'
import type { Readable } from 'node:stream'

import type { ContentDispositionType } from '@uplo/utils'

import type { BlobData, BlobStoragePath } from './attachment'

export interface ServiceUpdateMetadataOptions {
  contentType?: string
  disposition?: ContentDispositionType
  fileName?: string
}

export interface ServiceDirectUploadData {
  url: string
  headers: object
}

export interface ServiceUploadParams {
  key: BlobData['key']
  content:
    | FsReadStream
    | Buffer
    | Uint8Array
    | string
    | globalThis.Blob
    | ReadableStream<any>
    | Uint8Array
  size: number | bigint
  contentType: string
  checksum: string
}

export interface ServiceObjectInfo {
  /** Stored file size in bytes */
  size: number
  /** Stored content type, if the storage returns one */
  contentType?: string
}

export interface Service {
  /**
   * Returns size and content type of a stored file, or `null` when it does not
   * exist. Used to check direct uploads before attaching them. Services without
   * it skip the check.
   */
  getObjectInfo?(options: { key: BlobData['key'] }): Promise<ServiceObjectInfo | null>
  /** Default path for files stored in this service. Attachment `storagePath` takes priority. */
  storagePath?: BlobStoragePath
  updateMetadata?(key: BlobData['key'], options: ServiceUpdateMetadataOptions): Promise<any>
  createReadStream(options: { key: BlobData['key'] }): Promise<Readable>
  directUploadHeaders?(blob: BlobData): Promise<Record<string, any>> | undefined
  directUploadUrl(blob: BlobData): Promise<string>
  delete({ key }: Pick<BlobData, 'key'>): Promise<boolean>
  upload(params: ServiceUploadParams): Promise<any>
  publicUrl(blob: BlobData): Promise<string>
  privateUrl(blob: BlobData, options?: object): Promise<string>
  protocolUrl(blob: BlobData): Promise<string>
  isPublic: boolean
}
