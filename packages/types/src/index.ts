export type ID = string | number;

export interface Blob {
  fileName: string;
  size: number;
  contentType: string;
  checksum: string;
  key: string;
  metadata: object;
  [property: string]: any;
}

export abstract class Service {
  constructor() { }
  abstract updateMetadata(key: string): Promise<any>;
  abstract name(): string;
  abstract downloadToTempfile({ key }: { key: string }, callback: (tmpPath: string) => void): any;
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
