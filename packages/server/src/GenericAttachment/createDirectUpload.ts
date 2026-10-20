import type { Adapter, Service } from '@uplo/types'

import { DirectUploadDisabledError, UploError } from '../errors.js'
import { buildBlobKey } from '../lib/buildBlobKey.js'
import type { Signer } from '../Signer'
import type { FormattedAttachmentOptions } from '../types/attachments.js'
import type { CreateDirectUploadParams } from '../types/generic-attachment.js'
import { validateBlobInputData } from '../utils/validateBobInputData.js'
import { validateClientMetadata } from '../utils/validateClientMetadata.js'

type Options = {
  params: CreateDirectUploadParams
  signer: ReturnType<typeof Signer>
  adapter: Adapter
  service: Service
  attachmentOptions: FormattedAttachmentOptions
  modelName: string
  attachmentName: string
}

export const createDirectUpload = async ({
  params,
  signer,
  adapter,
  service,
  attachmentOptions,
  modelName,
  attachmentName,
}: Options) => {
  if (!attachmentOptions.directUpload) {
    throw new DirectUploadDisabledError(
      `Direct upload is disabled for attachment "${modelName}.${attachmentName}"`,
    )
  }

  // Client metadata is kept under `client`, so it cannot override server fields
  const clientMetadata = validateClientMetadata(params.metadata)

  // Validate before building the key, so `storagePath` only runs for valid files
  await validateBlobInputData(params, attachmentOptions.validate, {
    modelName,
    attachmentName,
    metadata: clientMetadata,
  })

  const blobParams = {
    key: await buildBlobKey({
      service,
      storagePath: attachmentOptions.storagePath,
      serviceName: attachmentOptions.serviceName,
      modelName,
      attachmentName,
      fileName: params.fileName,
      contentType: params.contentType,
    }),
    fileName: params.fileName,
    contentType: params.contentType,
    size: params.size,
    checksum: params.checksum,
    metadata: clientMetadata ? { client: clientMetadata } : {},
  }

  const blob = await adapter.createBlob({
    params: {
      ...blobParams,
      serviceName: attachmentOptions.serviceName,
    },
  })

  const uploadData = {
    url: await service.directUploadUrl(blob),
    headers: service.directUploadHeaders ? await service.directUploadHeaders(blob) : {},
  }

  const signedId = await signer.generate({ blobId: blob.id, modelName, attachmentName }, 'blob')

  if (!signedId) {
    throw new UploError(`Failed to create Signed ID for direct upload`)
  }

  return {
    signedId: signedId,
    upload: uploadData,
  }
}
