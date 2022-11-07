import { promisify } from 'node:util';
import jwt, { Secret, SignOptions, VerifyOptions, GetPublicKeyOrSecret, JwtPayload } from 'jsonwebtoken';
import { Signer as TSigner, UploConfig } from '../types';
import { SignerError } from '../errors';

const signAsync = promisify<string | object | Buffer, Secret, SignOptions>(jwt.sign);
const verifyAsync = promisify<string, Secret | GetPublicKeyOrSecret,VerifyOptions>(jwt.verify);

export const Signer = (config: UploConfig): TSigner => {
  const generate = async (data: object, purpose: string) => {
    if (!config.privateKey) {
      throw new SignerError('Missing private key');
    }

    const token = await signAsync(data, config.privateKey, {
      audience: purpose,
      expiresIn: config.signedIdExpiresIn,
    }) as string | undefined;

    if (!token) {
      throw new SignerError('Failed to generate signed token');
    }

    return token;
  };

  const verify = async (token: string, purpose: string) => {
    if (!config.privateKey) {
      throw new SignerError('Missing private key');
    }

    const result = await verifyAsync(token, config.privateKey, { audience: purpose }) as JwtPayload | undefined;
    return result;
  };

  return {
    generate,
    verify,
  };
};
