import crypto from 'node:crypto';

export const checksumString = async (content: string) => {
  const buffer = Buffer.from(content, 'utf-8')
  return crypto.createHash('md5').update(buffer).digest('base64');
}
