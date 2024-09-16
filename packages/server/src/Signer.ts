import { ID } from '@uplo/types';
import { jwtVerify, JWTPayload, SignJWT } from 'jose';
import { UploConfig } from './types';
import { SignerError } from './errors';

const ISSUER = 'uplo';

export type SignerData = {
  blobId?: ID;
  [key: string]: string | number | undefined;
};

export type SignerPurpose = 'blob';

export const Signer = (config: UploConfig) => {
  const secret =
    config.privateKey && new TextEncoder().encode(config.privateKey);

  const generate = async (data: object, purpose: SignerPurpose) => {
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
  };

  const verify = async (token: string, purpose: SignerPurpose) => {
    if (!secret) {
      throw new SignerError('Missing private key');
    }

    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: purpose,
    });

    return payload as SignerData | undefined;
  };

  return {
    generate,
    verify,
  };
};
