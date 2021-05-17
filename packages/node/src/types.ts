export interface Blob {
  fileName: string;
  size: number;
  contentType: string;
  checksum: string;
  key: string;
  metadata: object;
}

export interface Config {
  privateKey?: string;
  signedIdExpiresIn?: number;
}

export type Analyzer = ({ key, filePath }: { key: string, filePath: string }) => object;

export abstract class Service {
  constructor() { }
  abstract updateMetadata(): any;
  abstract downloadToTempfile({ key }: { key: string }, callback: (tmpPath: string) => void): any;
}

export abstract class Adapter {
  constructor() { }
  abstract findBlob(): any;
  abstract attachBlob(): any;
  abstract findBlobByKey(key: string): Blob;
  abstract updateBlobMetadata({ key, metadata }: { key: string, metadata: object }): Blob;
}
