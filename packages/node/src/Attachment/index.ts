import {
  Adapter,
  Service,
  Attachment as TAttachment,
  AttachmentData,
  Analyzer,
} from '@uplo/types';
import { Blob } from '../Blob';
import { UploError } from '../errors';

export interface AttachmentOptions {
  data: AttachmentData;
  adapter: Adapter;
  services: Record<string, Service>;
  analyzers: Analyzer[];
}

export const Attachment = ({
  data,
  adapter,
  services,
  analyzers,
}: AttachmentOptions): TAttachment => {
  const service = services[data.blob.service];

  if (!service) {
    throw new UploError(`Cannot find service with name ${data.blob.service}`);
  }

  const blob = Blob({
    data: data.blob,
    adapter,
    service,
    analyzers,
  });

  return {
    ...data,
    blob,
  };
};
