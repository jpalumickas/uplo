// import mime from 'mime/lite';
import { checksum } from './checksum';
import { Metadata } from './types';

interface Options {
  host: string;
  mountPath?: string;
}

const createBlob = async (attachmentName: string, { file, metadata }: { file: File, metadata?: Metadata }, { host, mountPath = '/uploads' }: Options) => {
  if (file.type && !file.type.match(/.+\/.+/)) {
    return { data: null, error: 'Invalid content type' };
  }

  const requestData = {
    attachmentName,
    checksum: await checksum(file),
    size: file.size,
    fileName: file.name,
    contentType: file.type || 'application/octet-stream', //mime.getType(file.name),
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
