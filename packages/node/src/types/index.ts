import { ID, Blob, Service, Analyzer, Adapter } from '@uplo/types';
import { Callbacks } from './callbacks';
import { Signer } from '../Signer';
import { ModelAttachment } from '../ModelAttachment';
import { GenericAttachment }  from '../GenericAttachment';

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

export type UploOptionsAttachments = Partial<Record<string, Record<string, UploOptionsAttachment | true>>>;

export interface UploOptions<AttachmentsList extends UploOptionsAttachments> {
  services: {
    [serviceName: string]: Service;
  };
  defaultServiceName?: string;
  adapter: Adapter;
  config?: UploConfig;
  analyzers?: Analyzer[];
  callbacks?: Callbacks;
  attachments: AttachmentsList
}

export interface Uplo<AttachmentsList extends UploOptionsAttachments> {
  signer: ReturnType<typeof Signer>;
  adapter: Adapter;
  $services: Record<string, Service>;
  $findBlob: (id: ID) => Promise<Blob | null>;
  $findGenericAttachment: (name: `${string}.${string}`) => ReturnType<typeof GenericAttachment>;

  // attachments: Record<ModelNames, Record<string, ModelAttachment>>

  attachments: {
    [ModelName in keyof AttachmentsList]: (id: ID) => {
      [AttachmentName in keyof AttachmentsList[ModelName]]: ModelAttachment;
    };
  }
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
