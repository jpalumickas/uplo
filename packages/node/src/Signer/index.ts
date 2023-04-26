import { jwtVerify, JWTPayload, SignJWT } from 'jose';
import { SignerData, Signer as TSigner, UploConfig } from '../types';
import { SignerError } from '../errors';

const ISSUER = 'uplo';

export const Signer = (config: UploConfig): TSigner => {
  const secret =
    config.privateKey && new TextEncoder().encode(config.privateKey);

  const generate = async (data: object, purpose: string) => {
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

  const verify = async (token: string, purpose: string) => {
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
