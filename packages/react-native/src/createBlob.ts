import getFileInfo from './getFileInfo';
import mime from 'mime/lite';
import checksum from './checksum';
import { File } from './types';

interface Options {
  host: string;
  mountPath?: string;
}

const createBlob = async (file: File, { host, mountPath = '/uploads' }: Options) => {
  const filePath = file.localUri || file.uri;
  const fileData = await getFileInfo(filePath);

  if (!fileData) return { data: null, error: 'Cannot get data from file' };

  const fileName = file.filename || filePath.replace(/^.*[\\\/]/, '');

  const requestData = {
    checksum: await checksum(fileData.md5),
    size: fileData.size,
    fileName,
    contentType: file.type || mime.getType(fileName),
    metadata: {
      width: file.width,
      height: file.height,
    },
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
        error: null
      }
    } else {
      return { data: null, error: 'Failed to create direct upload blob' }
    }
  } catch(err) {
    let error = null;

    if (typeof err === 'string') {
      error = err;
    } else if (err instanceof Error) {
      error = err.message;
    }

    return { data: null, error }
  }
};

export default createBlob;
