import { checksumString } from '@uplo/utils'

import type { BlobInput } from './types.js'

export interface BlobStringInput {
  fileName: string
  contentType: string
  content: string
}

export const blobStringInput = async (input: BlobStringInput): Promise<BlobInput> => {
  return {
    fileName: input.fileName,
    // Byte size, not string length: "é" is 1 character but 2 bytes in UTF-8
    size: new TextEncoder().encode(input.content).byteLength,
    content: input.content,
    contentType: input.contentType,
    checksum: await checksumString(input.content),
  }
}
