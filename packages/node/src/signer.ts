import { promisify } from 'util';
import { sign as jwtSign, verify as jwtVerify, Secret, SignOptions, VerifyOptions, GetPublicKeyOrSecret  } from 'jsonwebtoken';
import { Config } from './types';

const signAsync = promisify<string | object | Buffer, Secret, SignOptions>(jwtSign)
const verifyAsync = promisify<string, Secret | GetPublicKeyOrSecret,VerifyOptions>(jwtVerify);

export const signer = (config: Config) => {
  const generate = async (data: object, purpose: string) => {
    if (!config.privateKey) {
      throw new Error('Missing private key');
    }

    const token = await signAsync(data, config.privateKey, {
      audience: purpose,
      expiresIn: config.signedIdExpiresIn,
    });
    return token;
  };

  const verify = async (token: string, purpose: string) => {
    if (!config.privateKey) {
      throw new Error('Missing private key');
    }

    return await verifyAsync(token, config.privateKey, { audience: purpose });
  };

  return {
    generate,
    verify,
  };
};

export default signer;
