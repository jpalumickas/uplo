import type { ReadStream as FsReadStream } from 'node:fs';
import type { Readable } from 'node:stream';
import { ContentDispositionType } from '@uplo/utils';
import { BlobData } from './attachment';

export interface ServiceUpdateMetadataOptions {
  contentType?: string;
  disposition?: ContentDispositionType;
  fileName?: string;
}

export interface ServiceDirectUploadData {
  url: string;
  headers: object;
}

export interface ServiceUploadParams {
  key: BlobData['key'];
  content:
    | FsReadStream
    | Buffer
    | Uint8Array
    | string
    | globalThis.Blob
    | ReadableStream<any>
    | Uint8Array;
  size: number | bigint;
  contentType: string;
  checksum: string;
}

export interface Service {
  updateMetadata?(
    key: BlobData['key'],
    options: ServiceUpdateMetadataOptions
  ): Promise<any>;
  createReadStream(options: { key: BlobData['key'] }): Promise<Readable>;
  directUploadHeaders?(
    blob: BlobData
  ): Promise<Record<string, any>> | undefined;
  directUploadUrl(blob: BlobData): Promise<string>;
  delete({ key }: Pick<BlobData, 'key'>): Promise<boolean>;
  upload(params: ServiceUploadParams): Promise<any>;
  publicUrl(blob: BlobData): Promise<string>;
  privateUrl(blob: BlobData, options?: object): Promise<string>;
  protocolUrl(blob: BlobData): Promise<string>;
  isPublic: boolean;
}
