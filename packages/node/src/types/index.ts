import { ID, Blob, Service, Analyzer, Adapter } from '@uplo/types';
import { Callbacks } from './callbacks';
import { Signer } from './signer';
import { ModelAttachment } from '../ModelAttachment';
import { GenericAttachment }  from '../GenericAttachment';

export * from './callbacks';
export * from './signer';

export interface UploConfig {
  privateKey?: string;
  signedIdExpiresIn?: number;
}

export interface UploOptionsAttachment {
  multiple?: boolean;
  service?: string;
  directUpload?: boolean;
  contentType?: string | string[] | RegExp;
}

export interface UploOptions {
  services: {
    [serviceName: string]: Service;
  };
  adapter: Adapter;
  config?: UploConfig;
  analyzers?: Analyzer[];
  callbacks?: Callbacks;
  attachments: {
    [modelName: string]: {
      [attachmentName: string]: UploOptionsAttachment | true;
    };
  };
}

export interface Uplo {
  signer: Signer;
  adapter: Adapter;
  $services: Record<string, Service>;
  $findBlob: (id: ID) => Promise<Blob | null>;
  $findGenericAttachment: (name: `${string}.${string}`) => ReturnType<typeof GenericAttachment>;
  attachments: {
    [modelName: string]: {
      [attachmentName: string]: ModelAttachment;
    };
  };
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
