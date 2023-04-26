import { ID } from '@uplo/types';

export type SignerData = {
  blobId?: ID;
  [key: string]: string | number | undefined;
}

export type SignerPurpose = 'blob';

export interface Signer {
  generate: (data: SignerData, purpose: SignerPurpose) => Promise<string>;
  verify: (token: string, purpose: SignerPurpose) => Promise<SignerData | undefined>;
}
