import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

/**
 * Returns a safe temp file name. The original file name comes from the client,
 * so only its extension is kept, and only when it is plain letters and digits.
 */
export const tempFileName = (fileName: string) => {
  const extension = path.extname(path.basename(fileName.replaceAll('\\', '/'))).slice(1)

  return /^[a-z0-9]{1,16}$/i.test(extension) ? `file.${extension.toLowerCase()}` : 'file'
}

export const tempFile = async <T>(
  callback: (tmpPath: string) => Promise<T>,
  { fileName }: { fileName: string },
) => {
  const temporaryDirectory = await fs.realpath(os.tmpdir())
  const temporaryFileDirectory = path.join(temporaryDirectory, crypto.randomUUID())
  const temporaryFilePath = path.join(temporaryFileDirectory, tempFileName(fileName))

  await fs.mkdir(temporaryFileDirectory, { recursive: true })

  try {
    return await callback(temporaryFilePath)
  } finally {
    await fs.rm(temporaryFileDirectory, {
      recursive: true,
      force: true,
      maxRetries: 2,
    })
  }
}
