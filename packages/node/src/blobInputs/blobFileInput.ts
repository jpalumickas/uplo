import mime from 'mime/lite'
import crypto from 'node:crypto'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { basename } from 'node:path'

import { type BlobInput, UploError } from '@uplo/server'

export interface BlobFileInput {
  path: string
  fileName?: string
  contentType?: string
}

const checksumFromFile = async (path: string) => {
  const hash = crypto.createHash('md5')
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk)
  }
  return hash.digest('base64')
}

export const blobFileInput = async (input: BlobFileInput): Promise<BlobInput> => {
  // stat follows symlinks, so size is the size of the target file
  const { size } = await stat(input.path)
  const fileName = input.fileName || basename(input.path)
  const contentType = input.contentType || mime.getType(fileName) || undefined

  if (!contentType) {
    throw new UploError('Cannot get content type from this path')
  }

  const checksum = await checksumFromFile(input.path)

  return {
    fileName,
    size,
    // New stream, the checksum stream is already read to the end
    content: createReadStream(input.path),
    contentType,
    checksum,
  }
}
