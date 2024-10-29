import { BlobValidationError } from '../errors';
import { AttachmentValidateType } from '../types';

type BlobInputData = {
  fileName: string;
  contentType: string;
  size: number;
  checksum: string;
};

const validateContentType = (
  contentType: string,
  contentTypeValidator: AttachmentValidateType['contentType']
) => {
  if (!contentType) {
    throw new BlobValidationError('Missing content type');
  }

  if (!contentTypeValidator) {
    return true;
  }
  const list = Array.isArray(contentTypeValidator)
    ? contentTypeValidator
    : [contentTypeValidator];

  if (
    !list.some((input) =>
      input instanceof RegExp ? input.test(contentType) : input === contentType
    )
  ) {
    throw new BlobValidationError('Invalid content type');
  }

  return true;
};

export const validateBlobInputData = (
  blobInputData: BlobInputData,
  validator: AttachmentValidateType | null | undefined
) => {
  if (
    !blobInputData?.fileName?.trim() ||
    !blobInputData?.contentType?.trim() ||
    !blobInputData?.size ||
    !blobInputData?.checksum?.trim()
  ) {
    throw new BlobValidationError('Missing data for attachment');
  }

  if (!validator) {
    return true;
  }

  validateContentType(blobInputData.contentType, validator.contentType);

  return true;
};
