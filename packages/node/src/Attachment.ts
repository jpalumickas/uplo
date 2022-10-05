import { Adapter, Service, Attachment as TAttachment, AttachmentData } from '@uplo/types';
import { AttachmentFile } from './AttachmentFile';

export interface AttachmentOptions {
  data: AttachmentData;
  adapter: Adapter;
  service: Service;
}

export const Attachment = ({ data, adapter, service }: AttachmentOptions): TAttachment => {
  return {
    file: AttachmentFile({ data: data.blob, adapter, service }),
    ...data,
  }
}
