import type { ID } from '@uplo/types'

import { Blob } from './Blob'
import { UploError, AttachmentNotFoundError } from './errors'
import { GenericAttachment } from './GenericAttachment'
import { defaultConfig } from './lib/defaultConfig'
import { findAttachmentOptions } from './lib/findAttachmentOptions'
import { formatAttachmentOptions } from './lib/formatAttachmentOptions'
import { ModelAttachment } from './ModelAttachment'
import { Signer } from './Signer'
import type {
  UploOptions,
  UploAttachments,
  UploOptionsAttachments,
  UploOptionsAttachment,
  UploInstance,
} from './types'

export const createUplo = <AttachmentsList extends UploOptionsAttachments>({
  services = {},
  defaultServiceName,
  adapter,
  config: providedConfig,
  callbacks = {},
  attachments,
}: UploOptions<AttachmentsList>): UploInstance<AttachmentsList> => {
  const config = Object.assign({}, defaultConfig, providedConfig)
  const signer = Signer(config)

  const findBlob = async (blobId: ID) => {
    const blobData = await adapter.findBlob(blobId)
    if (!blobData) {
      return null
    }

    const service = services[blobData.serviceName]
    if (!service) {
      throw new UploError(`Cannot find service with name ${blobData.serviceName}`)
    }

    return Blob({ data: blobData, adapter: adapter, service })
  }

  const formattedModelAttachments = Object.keys(attachments).reduce((result, modelName) => {
    const modelAttachments = attachments[modelName]

    // @ts-ignore
    result[modelName] = (modelId: ID) =>
      Object.keys(modelAttachments!).reduce((r, attachmentName) => {
        const attachmentOptions = modelAttachments![attachmentName] as UploOptionsAttachment
        // @ts-ignore
        r[attachmentName] = new ModelAttachment({
          modelId,
          modelName,
          attachmentName,
          options: formatAttachmentOptions({
            attachmentOptions,
            services,
            defaultServiceName,
          }),
          services,
          adapter,
          signer,
          callbacks,
        })
        return r
      }, {})
    return result
  }, {}) as UploAttachments<typeof attachments>

  return {
    signer,
    adapter,
    $services: services,
    $findBlob: findBlob,
    $findGenericAttachment: (name: `${string}.${string}`) => {
      const found = findAttachmentOptions(attachments, name)
      if (!found) {
        throw new AttachmentNotFoundError(`Attachment with name ${name} not found`)
      }
      const { modelName, attachmentName, options: attachmentOptions } = found

      return GenericAttachment({
        signer,
        modelName,
        attachmentName,
        adapter,
        services,
        options: formatAttachmentOptions({
          attachmentOptions,
          services,
          defaultServiceName,
        }),
      })
    },
    // @ts-ignore
    attachments: formattedModelAttachments,
  }
}

export type * from '@uplo/types'
export type * from './types'
export * from './errors'
export * from './blobInputs'
export type * from './blobInputs/types.js'
