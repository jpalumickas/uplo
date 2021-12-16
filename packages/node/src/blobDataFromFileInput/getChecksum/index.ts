import crypto from 'crypto';
import fs from 'fs';

const checksumFromReadStream = (input: fs.ReadStream): Promise<string> => {
  return new Promise((resolve, reject) => {
    const output = crypto.createHash('md5');

    input.on('error', (err) => {
      reject(err);
    });

    output.once('readable', () => {
      resolve(output.digest('base64'));
    });

    input.pipe(output);
  });
};

export const getChecksum = async (input: any): Promise<string | undefined> => {
  if (typeof input === 'string') {
    const fileStream = fs.createReadStream(input);
    return checksumFromReadStream(fileStream);
  } else if (input instanceof Buffer || input instanceof Uint8Array) {
    return crypto.createHash('md5').update(input).digest('base64');
  }

  return undefined;
};
