import { File as ExpoFile } from 'expo-file-system';

interface FileInfo {
  md5: string;
  size: number;
}

export const getFileInfo = async (
  filePath: string
): Promise<FileInfo | null> => {
  try {
    const file = new ExpoFile(filePath);
    const result = file.info({
      md5: true,
    });

    if (!result) return null;
    if (!result.exists) return null;
    if (!result.md5) return null;
    if (!result.size) return null;

    return {
      md5: result.md5,
      size: result.size,
    };
  } catch (err) {
    console.error('[Uplo] Error getting file info:', err);
    return null;
  }
};
