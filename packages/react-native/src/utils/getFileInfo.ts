interface FileInfo {
  md5: string;
  size: number;
}

type EFSResult = {
  md5?: string;
  size: number;
  exists: boolean;
};

export const getFileInfo = async (
  filePath: string
): Promise<FileInfo | null> => {
  try {
    const expoFileSystem = require('expo-file-system');
    const result: EFSResult = await expoFileSystem.getInfoAsync(filePath, {
      md5: true,
      size: true,
    });

    if (!result) return null;
    if (!result.exists) return null;
    if (!result.md5) return null;

    return {
      md5: result.md5,
      size: result.size,
    };
  } catch (err) {
    return null;
  }
};
