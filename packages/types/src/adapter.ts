import { ID } from './general';
import { AttachmentData, BlobData } from './attachment';

export interface CreateBlobParams {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
  metadata?: object;
  checksum: string;
  serviceName: string;
  [property: string]: any;
}

export interface CreateBlobOptions {
  params: CreateBlobParams;
}

export interface AttachBlobOptions {
  blob: BlobData;
  attachmentName: string;
  recordId: string;
  recordType: string;
  strategy: 'one' | 'many';
  returnQuery?: boolean;
  [property: string]: any;
}

export interface dapter {
  findBlob(id: ID): Promise<BlobData | null>;
  findBlobByKey(key: string): Promise<BlobData | null>;
  attachBlob(options: AttachBlobOptions): AttachmentData;
  createBlob(options: CreateBlobOptions): Promise<BlobData>;
  updateBlobMetadata({ key, metadata }: { key: BlobData['key'], metadata: BlobData['metadata'] }): Promise<BlobData | null>;
  findAttachments(options: { recordId: AttachmentData['recordId'], recordType: AttachmentData['recordType'], name: AttachmentData['name'] }): Promise<AttachmentData[]>;
}
