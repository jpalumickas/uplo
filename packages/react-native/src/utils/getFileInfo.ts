import { File as ExpoFile } from 'expo-file-system'

interface FileInfo {
  md5: string
  size: number
}

// `digest()` exists from expo-file-system 58. Older versions only expose MD5 through `info()`.
const getMD5 = async (file: ExpoFile): Promise<string | undefined> => {
  if (typeof file.digest === 'function') {
    return await file.digest('MD5')
  }

  return file.info({ md5: true }).md5
}

export const getFileInfo = async (filePath: string): Promise<FileInfo | null> => {
  try {
    const file = new ExpoFile(filePath)
    const { exists, size } = file.info()

    if (!exists || !size) {
      return null
    }

    const md5 = await getMD5(file)
    if (!md5) {
      return null
    }

    return { md5, size }
  } catch (err) {
    console.error('[Uplo] Error getting file info:', err)
    return null
  }
}
