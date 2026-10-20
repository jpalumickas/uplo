import type { BlobStoragePath } from '@uplo/types'

import type { AttachmentValidateType } from './config'

export interface FormattedAttachmentOptions {
  multiple: boolean
  serviceName: string
  directUpload: boolean
  validate?: AttachmentValidateType
  storagePath?: BlobStoragePath
}
