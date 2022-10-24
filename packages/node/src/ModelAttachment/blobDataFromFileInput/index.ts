import fs from 'node:fs';
import { getSize } from './getSize';
import { getFileName } from './getFileName';
import { getContentType } from './getContentType';
import { getChecksum } from './getChecksum';

export type Input = string | Uint8Array | Buffer | ReadableStream | fs.ReadStream | Blob;

export const blobDataFromFileInput = async (input: Input) => {
  return {
    size: getSize(input),
    fileName: getFileName(input),
    contentType: getContentType(input),
    checksum: await getChecksum(input),
  }
}
