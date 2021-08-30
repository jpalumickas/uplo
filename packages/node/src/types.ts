import { JwtPayload } from 'jsonwebtoken';
import { Blob, ID, Service, Analyzer, Adapter } from '@uplo/types';

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

export type BeforeAttachCallback = ({ blobId }: { blobId: String | Number }) => void;
export type AfterAttachCallback = ({ blob }: { blob: Blob }) => void;

export type Callbacks = {
  beforeAttach?: BeforeAttachCallback;
  afterAttach?: AfterAttachCallback;
}

export type SignerData = {
  blobId?: ID;
  [key: string]: string | number | undefined;
}

export type SignerPurpose = 'blob';

export interface SignerResult {
  generate: (data: SignerData, purpose: SignerPurpose) => Promise<string | undefined>;
  verify: (token: string, purpose: SignerPurpose) => Promise<(JwtPayload & SignerData) | undefined>;
}

export interface Signer {
  (config: Config): SignerResult;
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

export interface CreateDirectUpload {

}
