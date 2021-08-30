import { Blob, ID, Service, Analyzer, Adapter } from '@uplo/types';
import { Callbacks } from './callbacks';
import { SignerResult } from './signer';

export * from './callbacks';
export * from './signer';

export interface Config {
  privateKey?: string;
  signedIdExpiresIn?: number;
}

export interface UploOptions {
  service: Service;
  adapter: Adapter;
  config?: Config;
  analyzers?: Analyzer[];
  callbacks?: Callbacks;
}

export interface UploInstance {
  signer: SignerResult;
  adapter: Adapter;
  service: Service;
  generateBlobKey: () => string;
  attachSignedFile: (options: AttachSignedFileOptions) => Promise<void>;
  analyze: (blob: Blob) => Promise<object>;
  createDirectUpload: ({ params }: { params: CreateDirectUploadParams }) => Promise<object>
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
}
