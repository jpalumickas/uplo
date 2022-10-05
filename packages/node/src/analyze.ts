import { isEmpty, merge } from 'lodash';
import { Service, Adapter, BlobData, Analyzer } from '@uplo/types';
import { AnalyzeError } from './errors';

const analyze =
  ({
    service,
    adapter,
    analyzers,
  }: {
    service: Service;
    adapter: Adapter;
    analyzers: Analyzer[];
  }) =>
  async ({ key }: { key: BlobData['key'] }): Promise<BlobData['metadata']> => {
    if (isEmpty(analyzers)) {
      console.warn(
        `[Uplo] No analyzers provided. Skipping analyze for Blob ${key}`
      );
      return {};
    }

    let blob = await adapter.findBlobByKey(key);
    if (!blob) {
      throw new AnalyzeError(`Cannot find blob with key ${key}`);
    }

    const newMetadata = {};

    await service.downloadToTempfile({ key: blob.key }, async (filePath) => {
      merge(newMetadata, { identified: true });

      for (const analyzer of analyzers) {
        try {
          if (blob) {
            const analyzerMetadata = await analyzer({ filePath, blob });
            if (!isEmpty(analyzerMetadata)) {
              merge(newMetadata, analyzerMetadata);
            }
          }
        } catch (err) {
          if (err instanceof Error) {
            throw new AnalyzeError(err.message);
          } else {
            throw err
          }
        }
      }

      merge(newMetadata, { analyzed: true });
    });

    await adapter.updateBlobMetadata({ key, metadata: newMetadata });

    return newMetadata;
  };

export default analyze;
