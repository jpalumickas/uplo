import { getSize } from './getSize';
import { getFileName } from './getFileName';
import { getContentType } from './getContentType';
import { getChecksum } from './getChecksum';

type Input = string | Uint8Array | Buffer | ReadableStream | Blob;

const blobDataFromFile = (input: Input) => {
  return {
    size: getSize(input),
    fileName: getFileName(input),
    contentType: getContentType(input),
    checksum: getChecksum(input),
  }
}

export default blobDataFromFile;
