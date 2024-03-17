import { downloadToTempfile } from './downloadToTempfile';
import { analyze } from './analyze';
import type { Analyzer } from './types';

export interface AnalyzerOptions {
  analyzers: Analyzer[];
}

export const UploAnalyzer = ({ analyzers = [] }: AnalyzerOptions) => {
  return {
    analyze: analyze(analyzers),
    downloadToTempfile,
  };
};

export type * from './types';

export default UploAnalyzer;
