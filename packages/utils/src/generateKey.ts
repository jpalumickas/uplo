import { randomBytes } from 'node:crypto';

/**
  * Returns random key. This is used to generate Blob key.
  *
  * @param size - Length of the key
  * @returns Generated key
  *
  */
export const generateKey = async (size: number = 32) => {
  return randomBytes(size).toString('hex');
};
