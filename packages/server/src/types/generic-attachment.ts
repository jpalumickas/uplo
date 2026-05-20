import type { Service, Adapter } from '@uplo/types'

import { Signer } from '../Signer'
import { FormattedAttachmentOptions } from './attachments'

export interface CreateDirectUploadParamsMetadata {
  [key: string]: string | number | null
}

export interface CreateDirectUploadParams {
  fileName: string
  contentType: string
  size: number
  checksum: string
  metadata?: CreateDirectUploadParamsMetadata
}

export interface GenericAttachmentParams {
  adapter: Adapter
  options: FormattedAttachmentOptions
  services: Record<string, Service>
  signer: ReturnType<typeof Signer>
}
