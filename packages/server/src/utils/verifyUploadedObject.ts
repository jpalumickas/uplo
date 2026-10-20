import type { BlobData, Service } from '@uplo/types'

import { BlobNotUploadedError, BlobValidationError } from '../errors'

// "image/png; charset=binary" -> "image/png"
const mediaType = (contentType: string) => contentType.split(';')[0]!.trim().toLowerCase()

/**
 * Checks that a direct upload reached storage with the declared size and
 * content type. Skipped when the service cannot return object info.
 */
export const verifyUploadedObject = async (service: Service, blob: BlobData) => {
  if (!service.getObjectInfo) {
    return
  }

  const info = await service.getObjectInfo({ key: blob.key })

  if (!info) {
    throw new BlobNotUploadedError(`File for blob ${blob.id} was not uploaded`)
  }

  if (info.size !== Number(blob.size)) {
    throw new BlobValidationError(
      `Uploaded file size ${info.size} does not match declared size ${blob.size}`,
    )
  }

  if (info.contentType && mediaType(info.contentType) !== mediaType(blob.contentType)) {
    throw new BlobValidationError(
      `Uploaded content type "${info.contentType}" does not match declared "${blob.contentType}"`,
    )
  }
}
