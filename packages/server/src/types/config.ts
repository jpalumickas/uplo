import type { Service, Adapter, BlobStoragePath, ClientMetadata, ID } from '@uplo/types'

import type { Callbacks } from './callbacks'

export interface UploConfig {
  /**
   * Secret used to sign direct upload IDs. At least 32 bytes, e.g. from
   * `openssl rand -base64 32`. Required for direct uploads.
   */
  privateKey?: string
  signedIdExpiresIn?: number
}

export interface AttachmentValidateCustomParams {
  fileName: string
  contentType: string
  /** File size in bytes */
  size: number
  checksum: string
  /** Client metadata, only for direct uploads */
  metadata?: ClientMetadata
  modelName: string
  attachmentName: string
  /** Record ID, only in `attachFile`. Direct uploads are created before the record is known. */
  recordId?: ID
}

/**
 * Custom validation. Return an error message to refuse the file
 * (`BlobValidationError`), or nothing to accept it. Thrown errors are passed on.
 */
export type AttachmentValidateCustom = (
  params: AttachmentValidateCustomParams,
) => string | void | Promise<string | void>

type AttachmentValidateObjectType = {
  /** File content type */
  contentType?: string | string[] | RegExp | RegExp[]
  /** File size in bytes */
  size?: {
    /** Minimum file size in bytes */
    min?: number
    /** Maximum file size in bytes */
    max?: number
  }
  /** Runs after `contentType` and `size` checks */
  custom?: AttachmentValidateCustom
}

export type AttachmentValidateType = AttachmentValidateObjectType

export interface UploOptionsAttachment {
  multiple?: boolean
  serviceName?: string
  /** Support direct upload to service with Signed URL */
  directUpload?: boolean
  validate?: AttachmentValidateType
  /** Path in the bucket for new files. Overrides service `storagePath`. */
  storagePath?: BlobStoragePath
}

export type UploOptionsAttachments = Partial<
  Record<string, Record<string, UploOptionsAttachment | true>>
>

export interface UploOptions<AttachmentsList extends UploOptionsAttachments = {}> {
  services: {
    [serviceName: string]: Service
  }
  defaultServiceName?: string
  adapter: Adapter
  config?: UploConfig
  callbacks?: Callbacks
  attachments: AttachmentsList
}
