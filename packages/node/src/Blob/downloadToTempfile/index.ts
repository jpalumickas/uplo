import { file as tempyFile } from 'tempy';
import { Service } from '@uplo/types';
import { UploError } from '../../errors';

export const downloadToTempfile = ({ key, fileName, service }: { key: string, fileName: string, service: Service }) => async (callback: (tmpPath: string) => void) => {
    return await tempyFile.task(
      async (tmpPath) => {
        try {
          await service.download({ key, path: tmpPath });
          return await callback(tmpPath);
        } catch(err) {
          if (err instanceof UploError) {
            throw err;
          } else if (err instanceof Error) {
            throw new UploError(`Failed to download blob with key ${key}. ${err.message}`);
          } else {
            throw new UploError(`Failed to download blob with key ${key}.`);
          }

          return;
        }
      },
      {
        name: fileName,
      }
    );
  }
