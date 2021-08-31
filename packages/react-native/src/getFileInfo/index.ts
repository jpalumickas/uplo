import EFS from 'expo-file-system';

interface FileInfo {
  md5: string;
  size: number;
}

const getFileInfo = async (filePath: string): Promise<FileInfo | null> => {
  try {
    const expoFileSystem: typeof EFS = require('expo-file-system');
    const result = await expoFileSystem.getInfoAsync(filePath, {
      md5: true,
      size: true,
    });
    if (!result || !result.md5) return null;

    return {
      md5: result.md5,
      size: result.size,
    }
  } catch (err) {
    console.log('a');
    return null;
  }
}

export default getFileInfo;
