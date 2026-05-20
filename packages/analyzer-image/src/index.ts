import sharp from 'sharp'

import type { Analyzer } from '@uplo/analyzer'

const ORIENTATIONS = [
  'Undefined',
  'Top-Left',
  'Top-Right',
  'Bottom-Right',
  'Bottom-Left',
  'Left-Top',
  'Right-Top',
  'Right-Bottom',
  'Left-Bottom',
]

export const imageAnalyzer =
  (): Analyzer =>
  async ({ blob: { contentType }, filePath }) => {
    if (!contentType.startsWith('image/')) {
      return
    }

    const metadata = await sharp(filePath).metadata()
    if (!metadata) {
      return
    }

    const orientation = ORIENTATIONS[metadata.orientation || 0]
    const isRotated = ['Right-Top', 'Left-Bottom'].includes(orientation)

    const result = {
      width: isRotated ? metadata.height : metadata.width,
      height: isRotated ? metadata.width : metadata.height,
    }

    return result
  }
