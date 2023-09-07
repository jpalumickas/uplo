import { file as tempyFile } from 'tempy';
import { Blob } from '@uplo/types';
import { UploError } from '@uplo/node';

export const downloadToTempfile = async (
  { blob }: { blob: Blob },
  callback: (tmpPath: string) => void
) => {
  return await tempyFile.task(
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

        return;
      }
    },
    {
      name: blob.fileName,
    }
  );
};
