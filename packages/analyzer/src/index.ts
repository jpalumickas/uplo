import merge from 'deepmerge';
import { Blob, Analyzer as AnalyzerType } from '@uplo/types';
import { AnalyzeError } from '@uplo/node';
import { downloadToTempfile } from './downloadToTempfile';

export interface AnalyzerOptions {
  analyzers: AnalyzerType[];
}

export const Analyzer = ({ analyzers = [] }: AnalyzerOptions) => {
  const analyze = async ({
    blob,
  }: {
    blob: Blob;
  }): Promise<Blob['data']['metadata']> => {
    if (!analyzers || analyzers.length === 0) {
      console.warn(
        `[Uplo] No analyzers provided. Skipping analyze for Blob ${blob.data.key}`
      );
      return {};
    }

    let newMetadata = {};

    await downloadToTempfile({ blob }, async (filePath) => {
      for (const analyzer of analyzers) {
        try {
          const analyzerMetadata = await analyzer({ filePath, blob });

          if (analyzerMetadata && Object.keys(analyzerMetadata).length > 0) {
            newMetadata = merge(newMetadata, analyzerMetadata);
          }
        } catch (err) {
          if (err instanceof Error) {
            throw new AnalyzeError(err.message);
          } else {
            throw err;
          }
        }
      }

      newMetadata = merge(newMetadata, { analyzed: true });
    });

    await blob.updateMetadata(newMetadata);

    return newMetadata;
  };

  return {
    analyze,
    downloadToTempfile,
  };
};
