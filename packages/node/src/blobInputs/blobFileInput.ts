import { ReadStream, createReadStream, lstatSync } from 'node:fs';
import { basename } from 'node:path';
import crypto from 'node:crypto';
import mime from 'mime/lite';
import { BlobInput } from './types.js'
import { UploError } from '../errors'

export interface BlobFileInput {
  path: string
  fileName?: string
  contentType?: string
}

const checksumFromReadStream = (input: ReadStream): Promise<string> => {
  return new Promise((resolve, reject) => {
    const output = crypto.createHash('md5');

    input.on('error', (err) => {
      reject(err);
    });

    output.once('readable', () => {
      resolve(output.digest('base64'));
    });

    input.pipe(output);
  });
};

export const blobFileInput = async (input: BlobFileInput): Promise<BlobInput> => {
  const size = lstatSync(input.path).size;
  const fileName = input.fileName || basename(input.path);
  const contentType = input.contentType || mime.getType(fileName) || undefined;

  if (!contentType) {
    throw new UploError('Cannot get content type from this path')
  }

  const stream = createReadStream(input.path)
  const checksum = await checksumFromReadStream(stream)

  return {
    fileName,
    size,
    content: stream,
    contentType,
    checksum,
  }

}
