import {
  Adapter,
  Service,
  Attachment as TAttachment,
  AttachmentData,
  Analyzer,
} from '@uplo/types';
import { Blob } from './Blob';

export interface AttachmentOptions {
  data: AttachmentData;
  adapter: Adapter;
  service: Service;
  analyzers: Analyzer[];
}

export const Attachment = ({
  data,
  adapter,
  service,
  analyzers,
}: AttachmentOptions): TAttachment => {
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
