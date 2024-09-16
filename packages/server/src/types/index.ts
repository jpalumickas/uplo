import { ID, Blob, Service, Adapter } from '@uplo/types';
import { Callbacks } from './callbacks';
import { Signer } from '../Signer';
import { ModelAttachment } from '../ModelAttachment';
import { GenericAttachment } from '../GenericAttachment';

export * from './callbacks';

export interface UploConfig {
  privateKey?: string;
  signedIdExpiresIn?: number;
}

export interface UploOptionsAttachment {
  multiple?: boolean;
  serviceName?: string;
  directUpload?: boolean;
  contentType?: string | string[] | RegExp;
}

export type UploOptionsAttachments = Partial<
  Record<string, Record<string, UploOptionsAttachment | true>>
>;

export interface UploOptions<AttachmentsList extends UploOptionsAttachments> {
  services: {
    [serviceName: string]: Service;
  };
  defaultServiceName?: string;
  adapter: Adapter;
  config?: UploConfig;
  callbacks?: Callbacks;
  attachments: AttachmentsList;
}

export type UploAttachments<AttachmentsList> = {
  [ModelName in keyof AttachmentsList]: (id: ID) => {
    [AttachmentName in keyof AttachmentsList[ModelName]]: ModelAttachment;
  };
};

export interface UploInstance<AttachmentsList extends UploOptionsAttachments> {
  signer: ReturnType<typeof Signer>;
  adapter: Adapter;
  $services: Record<string, Service>;
  $findBlob: (id: ID) => Promise<Blob | null>;
  $findGenericAttachment: (
    name: `${string}.${string}`
  ) => ReturnType<typeof GenericAttachment>;

  attachments: UploAttachments<AttachmentsList>;
}

export interface CreateDirectUploadParamsMetadata {
  [key: string]: string | number | null;
}

export interface CreateDirectUploadParams {
  fileName: string;
  contentType: string;
  size: number;
  checksum: string;
  metadata?: CreateDirectUploadParamsMetadata;
}
