import { analyze } from './analyze'
import { downloadToTempfile } from './downloadToTempfile'
import type { Analyzer } from './types'

export interface AnalyzerOptions {
  analyzers: Analyzer[]
}

export const createAnalyzer = ({ analyzers = [] }: AnalyzerOptions) => {
  return {
    analyze: analyze(analyzers),
    downloadToTempfile,
  }
}

export type * from './types'
