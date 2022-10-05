import { ID } from './general';
import { Service } from './service';

export interface BlobData {
  fileName: string;
  size: number | bigint;
  contentType: string;
  checksum: string;
  key: string;
  metadata: object;
  [property: string]: any;
}

export interface Blob extends BlobData {

}

export interface AttachmentData {
  name: string;
  blobId: ID;
  recordId: ID;
  recordType: string;
  createdAt: Date;
  blob: BlobData;
}

export interface AttachmentFile extends BlobData {
  serviceName: string;
  service: Service;
  url: () => Promise<string>;
  protocolUrl: () => Promise<string>;
}

export interface Attachment extends AttachmentData {
  file: AttachmentFile;
}
