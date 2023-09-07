import type { ReadStream as FsReadStream } from 'node:fs';

export interface BlobInput {
  fileName: string;
  size: number;
  contentType: string;
  checksum: string;
  content:
    | string
    | FsReadStream
    | ReadableStream<any>
    | Blob
    | Uint8Array
    | Buffer;
}
