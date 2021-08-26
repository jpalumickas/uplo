import { JwtPayload } from 'jsonwebtoken';

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

export type Callbacks = {
  beforeAttach?: ({ blobId }: { blobId: String | Number }) => void,
  afterAttach?: ({ blob }: { blob: Blob }) => void,
}

export abstract class Service {
  constructor() { }
  abstract updateMetadata(key: string): Promise<any>;
  abstract name(): string;
  abstract downloadToTempfile({ key }: { key: string }, callback: (tmpPath: string) => void): any;
}

export abstract class Adapter {
  constructor() { }
  abstract findBlob(blobId: string): any;
  abstract attachBlob(): any;
  abstract findBlobByKey(key: string): Blob;
  abstract updateBlobMetadata({ key, metadata }: { key: string, metadata: object }): Blob;
}

export interface SignerResult {
  generate: (data: object, purpose: string) => Promise<string | undefined>;
  verify: (token: string, purpose: string) => Promise<JwtPayload | undefined>;
}

export interface Signer {
  (config: Config): SignerResult;
}
