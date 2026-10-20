import { BlobValidationError } from '../errors'
import type { AttachmentValidateCustomParams, AttachmentValidateType } from '../types'

type BlobInputData = {
  fileName: string
  contentType: string
  size: number
  checksum: string
}

const validateContentType = (
  contentType: string,
  contentTypeValidator: AttachmentValidateType['contentType'],
) => {
  if (!contentType) {
    throw new BlobValidationError('Missing content type')
  }

  if (!contentTypeValidator) {
    return true
  }
  const list = Array.isArray(contentTypeValidator) ? contentTypeValidator : [contentTypeValidator]

  if (
    !list.some((input) =>
      input instanceof RegExp ? input.test(contentType) : input === contentType,
    )
  ) {
    throw new BlobValidationError('Invalid content type')
  }

  return true
}

const validateSize = (size: number, sizeValidator: AttachmentValidateType['size']) => {
  if (!sizeValidator) {
    return true
  }

  if (sizeValidator.min !== undefined && size < sizeValidator.min) {
    throw new BlobValidationError('File size is too small')
  }

  if (sizeValidator.max !== undefined && size > sizeValidator.max) {
    throw new BlobValidationError('File size is too large')
  }

  return true
}

type ValidationContext = Pick<
  AttachmentValidateCustomParams,
  'modelName' | 'attachmentName' | 'recordId' | 'metadata'
>

export const validateBlobInputData = async (
  blobInputData: BlobInputData,
  validator: AttachmentValidateType | null | undefined,
  context: ValidationContext,
) => {
  if (!blobInputData?.fileName?.trim()) {
    throw new BlobValidationError('Missing file name')
  }

  if (!blobInputData?.size || !Number.isFinite(blobInputData.size) || blobInputData.size < 0) {
    throw new BlobValidationError('Missing size')
  }

  if (!blobInputData?.checksum?.trim()) {
    throw new BlobValidationError('Missing checksum')
  }

  if (!blobInputData?.contentType?.trim()) {
    throw new BlobValidationError('Missing content type')
  }

  if (!validator) {
    return true
  }

  validateContentType(blobInputData.contentType, validator.contentType)
  validateSize(blobInputData.size, validator.size)

  if (validator.custom) {
    const error = await validator.custom({
      fileName: blobInputData.fileName,
      contentType: blobInputData.contentType,
      size: blobInputData.size,
      checksum: blobInputData.checksum,
      ...context,
    })

    if (typeof error === 'string' && error) {
      throw new BlobValidationError(error)
    }
  }

  return true
}
