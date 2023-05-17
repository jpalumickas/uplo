import merge from 'lodash-es/merge';
import { Service, Adapter, BlobData, Analyzer } from '@uplo/types';
import { downloadToTempfile as downloadToTempfileFn } from '../downloadToTempfile';
import { AnalyzeError } from '../../errors';
import { Blob } from '../../Blob';

const analyze =
  async ({
    blobData,
    service,
    adapter,
    analyzers,
  }: {
    blobData: BlobData;
    service: Service;
    adapter: Adapter;
    analyzers: Analyzer[];
  }): Promise<BlobData['metadata']> => {
    if (!analyzers || analyzers.length === 0) {
      console.warn(
        `[Uplo] No analyzers provided. Skipping analyze for Blob ${blobData.key}`
      );
      return {};
    }

    const blob = Blob({ data: blobData, service, adapter, analyzers });
    const downloadToTempfile = downloadToTempfileFn({ key: blobData.key, fileName: blobData.fileName, service });

    const newMetadata = {};

    await downloadToTempfile(async (filePath) => {
      for (const analyzer of analyzers) {
        try {
          const analyzerMetadata = await analyzer({ filePath, blob });

          if (analyzerMetadata && Object.keys(analyzerMetadata).length > 0) {
            merge(newMetadata, analyzerMetadata);
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

    await adapter.updateBlobMetadata({ key: blobData.key, metadata: newMetadata });

    return newMetadata;
  };

export default analyze;
