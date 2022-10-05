import fs from 'node:fs';
import { ContentDispositionType } from '@uplo/utils';
import { BlobData } from './attachment';

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
  download(options: { key: string, path: string }): any;
  downloadToTempfile({ key }: { key: string }, callback: (tmpPath: string) => void): any;
  directUploadData(blob: BlobData): Promise<ServiceDirectUploadData>;
  directUploadUrl(blob: BlobData): Promise<string>;
  delete({ key }: Pick<BlobData, 'key'>): Promise<boolean>;
  upload(params: ServiceUploadParams): Promise<any>;
  publicUrl(blob: BlobData): Promise<string>;
  privateUrl(blob: BlobData, options?: object): Promise<string>;
  url(blob: BlobData, options?: object): Promise<string>;
  protocolUrl(blob: BlobData): Promise<string>;
}
