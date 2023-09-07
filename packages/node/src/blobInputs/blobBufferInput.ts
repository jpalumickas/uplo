import { createHash } from 'node:crypto';
import { BlobInput } from './types.js';

export interface BlobBufferInput {
  fileName: string;
  contentType: string;
  content: Buffer;
}

export const blobBufferInput = async (
  input: BlobBufferInput
): Promise<BlobInput> => {
  return {
    fileName: input.fileName,
    size: input.content.length,
    content: input.content,
    contentType: input.contentType,
    checksum: await createHash('md5').update(input.content).digest('base64'),
  };
};
