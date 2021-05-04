import { promisify } from 'util';
import jwt from 'jsonwebtoken';

const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export const signedId = (config) => {
  const generate = async (data, purpose) => {
    return await signAsync(data, config.privateKey, {
      audience: purpose,
      expiresIn: config.signedIdExpiresIn,
    });
  };

  const verify = async (token, purpose) => {
    return await verifyAsync(token, config.privateKey, { audience: purpose });
  };

  return {
    generate,
    verify,
  };
};

export default signedId;
