import crypto from 'node:crypto';

export const checksumString = async (content: string) => {
  return crypto.createHash('md5').update(content).digest('base64');
}
