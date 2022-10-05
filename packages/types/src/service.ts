import fs from 'node:fs';
import { ContentDispositionType } from '@uplo/utils';
import { Blob } from './index';

export interface ServiceUpdateMetadataOptions {
  contentType?: string;
  disposition?: ContentDispositionType;
  fileName?: string
}

export interface ServiceDirectUploadData {
  url: string;
  headers: object;
}

export interface ServiceUploadParams {
  key: string;
  content: fs.ReadStream | Buffer | Uint8Array | string;
  size: number | bigint;
  contentType: string;
  checksum: string;
}

export interface Service {
  updateMetadata(key: string, options: ServiceUpdateMetadataOptions): Promise<any>;
  name(): string;
  downloadToTempfile({ key }: { key: string }, callback: (tmpPath: string) => void): any;
  directUploadData(blob: Blob): Promise<ServiceDirectUploadData>;
  directUploadUrl(blob: Blob): Promise<string>;
  delete({ key }: Pick<Blob, 'key'>): Promise<boolean>;
  upload(params: ServiceUploadParams): Promise<any>;
  publicUrl(blob: Blob): Promise<string>;
  privateUrl(blob: Blob, options?: object): Promise<string>;
  url(blob: Blob, options?: object): Promise<string>;
  protocolUrl(blob: Blob): Promise<string>;
}
