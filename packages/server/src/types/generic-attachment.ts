import type { Service, Adapter, ClientMetadata } from '@uplo/types'

import type { Signer } from '../Signer'
import type { FormattedAttachmentOptions } from './attachments'

export type CreateDirectUploadParamsMetadata = ClientMetadata

export interface CreateDirectUploadParams {
  fileName: string
  contentType: string
  size: number
  checksum: string
  /** Client metadata, stored as `blob.metadata.client` */
  metadata?: CreateDirectUploadParamsMetadata
}

export interface GenericAttachmentParams {
  adapter: Adapter
  options: FormattedAttachmentOptions
  services: Record<string, Service>
  signer: ReturnType<typeof Signer>
  modelName: string
  attachmentName: string
}
