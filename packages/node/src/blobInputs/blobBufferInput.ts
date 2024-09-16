import { createHash } from 'node:crypto';
import type { BlobInput } from '@uplo/server';

export interface BlobBufferInput {
  fileName: string;
  contentType: string;
  buffer: Buffer;
}

export const blobBufferInput = async (
  input: BlobBufferInput
): Promise<BlobInput> => {
  return {
    fileName: input.fileName,
    size: input.buffer.length,
    content: input.buffer,
    contentType: input.contentType,
    checksum: await createHash('md5').update(input.buffer).digest('base64'),
  };
};
