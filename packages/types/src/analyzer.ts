import { Blob } from './index';

export interface AnalyzerOptions {
  blob: Blob;
  filePath: string;
}

export type Analyzer = ({ blob, filePath }: AnalyzerOptions) => object;
