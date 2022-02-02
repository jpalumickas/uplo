import { ContentDispositionType } from '@uplo/utils';
import fs from 'fs';

export type ID = string | number;

export interface Blob {
  fileName: string;
  size: number | bigint;
  contentType: string;
  checksum: string;
  key: string;
  metadata: object;
  [property: string]: any;
}

// Service

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

// Adapter

export interface CreateBlobParams {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
  metadata?: object;
  checksum: string;
  [property: string]: any;
}

export interface CreateBlobOptions {
  params: CreateBlobParams;
  service: Service;
}

export interface AttachBlobOptions {
  blob: Blob;
  attachmentName: string;
  recordId: string;
  recordType: string;
  strategy: 'one' | 'many';
  returnQuery?: boolean;
  [property: string]: any;
}

export abstract class Adapter {
  constructor() { }
  abstract findBlob(id: ID): Promise<Blob | null>;
  abstract findBlobByKey(key: string): Promise<Blob | null>;
  abstract attachBlob(options: AttachBlobOptions): any;
  abstract createBlob(options: CreateBlobOptions): Promise<Blob>;
  abstract updateBlobMetadata({ key, metadata }: { key: string, metadata: object }): Promise<Blob | null>;
}

// Analyzer

export interface AnalyzerOptions {
  blob: Blob;
  filePath: string;
}

export type Analyzer = ({ blob, filePath }: AnalyzerOptions) => object;
