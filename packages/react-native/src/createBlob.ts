import mime from 'mime/lite';
import { getFileInfo } from './utils/getFileInfo';
import { checksumFromMD5 } from './utils/checksumFromMD5';
import { File } from './types';

interface Options {
  host: string;
  mountPath?: string;
}

export const createBlob = async (
  attachmentName: string,
  file: File,
  { host, mountPath = '/uploads' }: Options
) => {
  if (file.contentType && !file.contentType.match(/.+\/.+/)) {
    return { data: null, error: 'Invalid content type' };
  }

  const filePath = file.localUri || file.uri;
  const fileData = await getFileInfo(filePath);

  if (!fileData) return { data: null, error: 'Cannot get data from file' };

  const fileName = file.fileName || filePath.replace(/^.*[\\\/]/, '');

  const metadata = {
    ...file.metadata,
  };

  if (file.width) {
    metadata.width = file.width;
  }
  if (file.height) {
    metadata.height = file.height;
  }

  const requestData = {
    attachmentName,
    checksum: await checksumFromMD5(fileData.md5),
    size: fileData.size,
    fileName,
    contentType: file.contentType || mime.getType(fileName),
    metadata,
  };

  try {
    const response = await fetch(`${host}${mountPath}/create-direct-upload`, {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        data,
        error: null,
      };
    } else {
      return { data: null, error: 'Failed to create direct upload blob' };
    }
  } catch (err) {
    let error = null;

    if (typeof err === 'string') {
      error = err;
    } else if (err instanceof Error) {
      error = err.message;
    }

    return { data: null, error };
  }
};
