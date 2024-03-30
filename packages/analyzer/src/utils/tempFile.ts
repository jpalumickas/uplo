import fs from 'node:fs/promises';
import os from 'node:os';
import crypto from 'node:crypto';

export const tempFile = async (
  callback: (tmpPath: string) => Promise<void>,
  { fileName }: { fileName: string }
) => {
  const temporaryDirectory = await fs.realpath(os.tmpdir());
  const temporaryFileDirectory = `${temporaryDirectory}/${crypto.randomUUID()}`;
  const temporaryFilePath = `${temporaryFileDirectory}/${fileName}`;

  await fs.mkdir(temporaryFileDirectory, { recursive: true });

  await callback(temporaryFilePath);

  await fs.rm(temporaryFileDirectory, {
    recursive: true,
    force: true,
    maxRetries: 2,
  });
};
