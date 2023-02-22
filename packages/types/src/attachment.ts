import type { ContentDispositionType } from '@uplo/utils';
import { ID } from './general';
import { Service } from './service';

export interface BlobMetadata {
  [key: string]: string | number | null;
}

export interface BlobData {
  id: ID;
  fileName: string;
  size: number | bigint;
  contentType: string;
  checksum: string;
  key: string;
  metadata: BlobMetadata;
  serviceName: string;
  // [property: string]: any;
}

export interface BlobUrlOptions {
  disposition?: ContentDispositionType
  expiresIn?: number
}
// export interface Blob extends Omit<BlobData, 'service'> {
export interface Blob {
  id: ID;
  fileName: string;
  size: number | bigint;
  contentType: string;
  checksum: string;
  key: string;
  metadata: BlobMetadata;
  data: BlobData;
  serviceName: string;
  service: Service;
  url: (opts?: BlobUrlOptions) => Promise<string>;
  protocolUrl: () => Promise<string>;
  analyze: () => Promise<BlobData['metadata']>;
  downloadToTempfile: (callback: (tmpPath: string) => void) => Promise<void>;
}

export interface AttachmentData {
  id: ID;
  name: string;
  blobId: ID;
  recordId: ID;
  recordType: string;
  createdAt: Date;
  blob: BlobData;
}

export interface Attachment extends Omit<AttachmentData, 'blob'> {
  blob: Blob;
  url: Blob['url'];
  protocolUrl: Blob['protocolUrl'];
  downloadToTempfile: Blob['downloadToTempfile'];
  metadata: Blob['metadata'];
}
