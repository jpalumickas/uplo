import { promisify } from 'util';
import { sign as jwtSign, verify as jwtVerify, Secret, SignOptions, VerifyOptions, GetPublicKeyOrSecret, JwtPayload } from 'jsonwebtoken';
import { Config, Signer } from './types';

const signAsync = promisify<string | object | Buffer, Secret, SignOptions>(jwtSign);
const verifyAsync = promisify<string, Secret | GetPublicKeyOrSecret,VerifyOptions>(jwtVerify);


export const signer: Signer = (config) => {
  const generate = async (data: object, purpose: string) => {
    if (!config.privateKey) {
      throw new Error('Missing private key');
    }

    const token = await signAsync(data, config.privateKey, {
      audience: purpose,
      expiresIn: config.signedIdExpiresIn,
    }) as string | undefined;
    return token;
  };

  const verify = async (token: string, purpose: string) => {
    if (!config.privateKey) {
      throw new Error('Missing private key');
    }

    const result = await verifyAsync(token, config.privateKey, { audience: purpose }) as JwtPayload | undefined;
    return result;
  };

  return {
    generate,
    verify,
  };
};

export default signer;
