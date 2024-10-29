import { BlobInput } from '@uplo/server';
import { checksumString } from '@uplo/utils';

export const imageUrlToBlobInput = async (url: string): Promise<BlobInput> => {
  const data = await fetch(url);
  const arrayBuffer = await data.arrayBuffer();
  const content = new Uint8Array(arrayBuffer);
  // const base64 = btoa(String.fromCharCode());
  const contentType = data.headers.get('content-type');

  if (!contentType) {
    throw new Error('Cannot get content type from image');
  }

  return {
    fileName: 'image.jpg',
    size: content.length,
    contentType,
    checksum: await checksumString(content),
    content: content,
  };
};
