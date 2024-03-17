import { Blob } from '@uplo/types';
import { UploError } from '@uplo/node';
import { tempFile } from './utils/tempFile.js';

export const downloadToTempfile = async (
  { blob }: { blob: Blob },
  callback: (tmpPath: string) => void
) => {
  return await tempFile(
    async (tmpPath) => {
      try {
        await blob.service.download({ key: blob.key, path: tmpPath });
        return await callback(tmpPath);
      } catch (err) {
        if (err instanceof UploError) {
          throw err;
        } else if (err instanceof Error) {
          throw new UploError(
            `Failed to download blob with key ${blob.key}. ${err.message}`
          );
        } else {
          throw new UploError(`Failed to download blob with key ${blob.key}.`);
        }
      }
    },
    {
      fileName: blob.fileName,
    }
  );
};
