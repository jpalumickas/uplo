import { isEmpty, merge } from 'lodash';
import { Service, Adapter, Config, Blob, Analyzer } from './types';

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
  async ({ key }: Blob): Promise<object> => {
    if (isEmpty(analyzers)) {
      console.warn(
        `[Uplo] No analyzers provided. Skipping analyze for Blob ${key}`
      );
      return {};
    }

    let blob = await adapter.findBlobByKey(key);
    if (!blob) {
      throw new Error(`Cannot find blob with key ${key}`);
    }

    const newMetadata = { analyzed: true };

    await service.downloadToTempfile({ key: blob.key }, async (filePath) => {
      for (const analyzer of analyzers) {
        try {
          const analyzerMetadata = await analyzer({ ...blob, filePath });
          if (!isEmpty(analyzerMetadata)) {
            merge(newMetadata, analyzerMetadata);
          }
        } catch (err) {
          console.error(err);
        }
      }
    });

    blob = await adapter.findBlobByKey(key);
    const metadata = { ...blob.metadata, ...newMetadata };
    await adapter.updateBlobMetadata({ key, metadata });

    return newMetadata;
  };

export default analyze;
