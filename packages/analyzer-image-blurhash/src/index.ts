import type { Analyzer } from '@uplo/analyzer'

import { encodeImageToBlurhash } from './encodeImageToBlurhash'

export const imageBlurhashAnalyzer =
  ({ size = 32, xComponents = 4, yComponents = 3 } = {}): Analyzer =>
  async ({ blob: { contentType }, filePath }) => {
    if (!contentType.startsWith('image/')) {
      return
    }

    const blurhash = await encodeImageToBlurhash({
      filePath,
      xComponents,
      yComponents,
      size,
    })
    return { blurhash }
  }
