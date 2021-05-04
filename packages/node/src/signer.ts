import { promisify } from 'util';
import { sign as jwtSign, verify as jwtVerify, Secret, SignOptions, VerifyOptions, GetPublicKeyOrSecret  } from 'jsonwebtoken';
import { Config } from './types';

const signAsync = (
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret,
  options?: SignOptions,
) => promisify(jwtSign);
const verifyAsync = (
  token: string,
  secretOrPublicKey: Secret | GetPublicKeyOrSecret,
  options?: VerifyOptions,
) => promisify(jwtVerify);

export const signedId = (config: Config) => {
  const generate = async (data: object, purpose: string) => {
    if (!config.privateKey) {
      throw new Error('Missing private key');
    }

    return await signAsync(data, config.privateKey, {
      audience: purpose,
      expiresIn: config.signedIdExpiresIn,
    });
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

export default signedId;
