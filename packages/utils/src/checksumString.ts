import crypto from 'node:crypto';

export const checksumString = async (content: string | Uint8Array) => {
  if (typeof content !== 'string') {
    throw new Error('Expected content to be a string');
  }

  const buffer = Buffer.from(content, 'utf-8');
  return crypto.createHash('md5').update(buffer).digest('base64');
};
