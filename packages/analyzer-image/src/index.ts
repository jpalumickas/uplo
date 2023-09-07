import { Analyzer } from '@uplo/analyzer';
import sharp from 'sharp';

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
];

const ImageAnalyzer =
  (): Analyzer =>
  async ({ blob: { contentType }, filePath }) => {
    if (!contentType.startsWith('image/')) return;

    const metadata = await sharp(filePath).metadata();
    if (!metadata) return;
    if (!metadata.orientation) return;

    const orientation = ORIENTATIONS[metadata.orientation];
    const isRotated = ['Right-Top', 'Left-Bottom'].includes(orientation);

    const result = {
      width: isRotated ? metadata.height : metadata.width,
      height: isRotated ? metadata.width : metadata.height,
    };

    return result;
  };

export default ImageAnalyzer;
