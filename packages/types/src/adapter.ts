import { Service } from './service';
import { ID } from './general';
import { AttachmentData, BlobData } from './attachment';

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
  blob: BlobData;
  attachmentName: string;
  recordId: string;
  recordType: string;
  strategy: 'one' | 'many';
  returnQuery?: boolean;
  [property: string]: any;
}

export abstract class Adapter {
  constructor() { }
  abstract findBlob(id: ID): Promise<BlobData | null>;
  abstract findBlobByKey(key: string): Promise<BlobData | null>;
  abstract attachBlob(options: AttachBlobOptions): AttachmentData;
  abstract createBlob(options: CreateBlobOptions): Promise<BlobData>;
  abstract updateBlobMetadata({ key, metadata }: { key: BlobData['key'], metadata: BlobData['metadata'] }): Promise<BlobData | null>;
}
