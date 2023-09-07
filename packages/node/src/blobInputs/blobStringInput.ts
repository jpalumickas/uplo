import { BlobInput } from './types.js'
import { checksumString } from '@uplo/utils'

export interface BlobStringInput {
  fileName: string
  contentType: string
  content: string
}

export const blobStringInput = async (input: BlobStringInput): Promise<BlobInput> => {
  return {
    fileName: input.fileName,
    size: input.content.length,
    content: input.content,
    contentType: input.contentType,
    checksum: await checksumString(input.content),
  }
}
