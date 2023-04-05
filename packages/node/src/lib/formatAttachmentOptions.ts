import { Service } from '@uplo/types';
import { UploOptionsAttachment } from '../types';
import { UploError } from '../errors'

export const formatAttachmentOptions = ({
  attachmentOptions,
  services,
  defaultServiceName,
}: {
  attachmentOptions: true | UploOptionsAttachment;
  services: Record<string, Service>;
  defaultServiceName?: string;
}) => {
  if (Object.keys(services).length === 0) {
    throw new UploError('At least one service must be provided');
  }

  const allServiceNames = Object.keys(services);

  const options = attachmentOptions === true ? {} : attachmentOptions;
  const serviceName = options.serviceName || defaultServiceName || allServiceNames[0];

  if (!allServiceNames.includes(serviceName)) {
    throw new UploError(`Service with name "${serviceName}" was not defined.`);
  }

  return {
    multiple: options.multiple ?? false,
    directUpload: options.directUpload ?? true,
    contentType: options.contentType,
    serviceName,
  };
};
