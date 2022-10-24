import { Service, Adapter } from '@uplo/types';
import { createDirectUpload } from './createDirectUpload';
import { Signer, CreateDirectUploadParams } from '../types';

interface Options {
  multiple: boolean;
  serviceName: string;
  directUpload: boolean;
  contentType?: string | string[] | RegExp;
}

interface GenericAttachmentParams {
  adapter: Adapter;
  options: Options;
  services: Record<string, Service>;
  signer: Signer;
}

export const GenericAttachment = ({
  adapter,
  options,
  services,
  signer,
}: GenericAttachmentParams) => {
  const service = services[options.serviceName];

  return {
    service,
    createDirectUpload: (params: CreateDirectUploadParams) =>
      createDirectUpload({
        params,
        service,
        serviceName: options.serviceName,
        adapter,
        signer,
      }),
  };
};
