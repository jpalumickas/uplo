import type { ID } from '@uplo/types';
import { jwtVerify, JWTPayload, SignJWT } from 'jose';
import { UploConfig } from './types';
import { SignerError } from './errors';

const ISSUER = 'uplo';

export type SignerBlobData = {
  blobId?: ID;
};
export type SignerData = SignerBlobData;

export type SignerPurpose = 'blob';

export const Signer = (config: UploConfig) => {
  const secret =
    config.privateKey && new TextEncoder().encode(config.privateKey);

  async function generate(
    data: SignerBlobData,
    purpose: 'blob'
  ): Promise<string>;
  async function generate(
    data: SignerData,
    purpose: SignerPurpose
  ): Promise<string> {
    if (!secret) {
      throw new SignerError('Missing private key');
    }

    const token = await new SignJWT(data as JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setAudience(purpose)
      .setExpirationTime(Date.now() + (config.signedIdExpiresIn || 3600))
      .sign(secret);

    if (!token) {
      throw new SignerError('Failed to generate signed token');
    }

    return token;
  }

  const verify = async (token: string, purpose: SignerPurpose) => {
    if (!secret) {
      throw new SignerError('Missing private key');
    }

    const { payload } = await jwtVerify<SignerData>(token, secret, {
      issuer: ISSUER,
      audience: purpose,
    });

    return payload;
  };

  return {
    generate,
    verify,
  };
};
