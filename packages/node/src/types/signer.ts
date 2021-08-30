import { JwtPayload } from 'jsonwebtoken';
import { ID } from '@uplo/types';
import { Config } from '../types';

export type SignerData = {
  blobId?: ID;
  [key: string]: string | number | undefined;
}

export type SignerPurpose = 'blob';

export interface SignerResult {
  generate: (data: SignerData, purpose: SignerPurpose) => Promise<string | undefined>;
  verify: (token: string, purpose: SignerPurpose) => Promise<(JwtPayload & SignerData) | undefined>;
}

export interface Signer {
  (config: Config): SignerResult;
}
