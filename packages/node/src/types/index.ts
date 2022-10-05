import { Blob, Service, Analyzer, Adapter } from '@uplo/types';
import { Callbacks } from './callbacks';
import { SignerResult } from './signer';
import ModelAttachment from '../modelAttachment';

export * from './callbacks';
export * from './signer';

export interface Config {
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
  config?: Config;
  analyzers?: Analyzer[];
  callbacks?: Callbacks;
  attachments: {
    [modelName: string]: {
      [attachmentName: string]: UploOptionsAttachment | true;
    };
  };
}

export interface UploInstance {
  signer: SignerResult;
  adapter: Adapter;
  service: Service;
  attachSignedFile: (options: AttachSignedFileOptions) => Promise<void>;
  analyze: (blob: Blob) => Promise<object>;
  createDirectUpload: ({
    params,
  }: {
    params: CreateDirectUploadParams;
  }) => Promise<object>;
  findAttachmentByName: (name: `${string}.${string}`) => ModelAttachment | null;
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

export interface AttachSignedFileOptions {
  signedId: string;
  modelName: string;
  modelId: string;
  attachmentName: string;
  strategy: 'one' | 'many';
  [k: string]: any;
}
