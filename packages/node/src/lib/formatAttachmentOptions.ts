import { Service } from '@uplo/types';
import { UploOptionsAttachment } from '../types';

export const formatAttachmentOptions = (attachmentOptions: true | UploOptionsAttachment, services: Record<string, Service>) => {
  if (Object.keys(services).length === 0) {
    throw new Error('At least one service must be provided');
  }

  const options = attachmentOptions === true ? {} : attachmentOptions;
  const serviceName = options.serviceName ? options.serviceName : Object.keys(services)[0];

  return {
    multiple: options.multiple ?? false,
    directUpload: options.directUpload ?? true,
    contentType: options.contentType,
    serviceName,
  }
}
