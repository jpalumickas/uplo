import { Blob } from '@uplo/types';

export interface AnalyzerOptions {
  blob: Blob;
  filePath: string;
}

export type Analyzer = ({
  blob,
  filePath,
}: AnalyzerOptions) => Promise<object | undefined>;
