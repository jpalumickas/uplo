import { JwtPayload } from 'jsonwebtoken';
import { Blob } from '@uplo/types';

export interface Config {
  privateKey?: string;
  signedIdExpiresIn?: number;
}

export type Analyzer = ({ key, filePath }: { key: string, filePath: string }) => object;

export type Callbacks = {
  beforeAttach?: ({ blobId }: { blobId: String | Number }) => void,
  afterAttach?: ({ blob }: { blob: Blob }) => void,
}


export interface SignerResult {
  generate: (data: object, purpose: string) => Promise<string | undefined>;
  verify: (token: string, purpose: string) => Promise<JwtPayload | undefined>;
}

export interface Signer {
  (config: Config): SignerResult;
}
