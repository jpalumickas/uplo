import type {
  CreateDirectUploadParams,
  GenericAttachmentParams,
} from '../types/generic-attachment.js'
import { createDirectUpload } from './createDirectUpload.js'

export const GenericAttachment = ({
  adapter,
  options,
  services,
  signer,
}: GenericAttachmentParams) => {
  const service = services[options.serviceName]

  return {
    service,
    createDirectUpload: ({ params }: { params: CreateDirectUploadParams }) =>
      createDirectUpload({
        params,
        service,
        attachmentOptions: options,
        adapter,
        signer,
      }),
  }
}
