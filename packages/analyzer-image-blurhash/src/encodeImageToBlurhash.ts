import sharp from 'sharp';
import { encode } from 'blurhash';

export const encodeImageToBlurhash = ({
  filePath,
  xComponents = 4,
  yComponents = 3,
  size = 32,
}: {
  filePath: string;
  xComponents: number;
  yComponents: number;
  size: number;
}) => {
  return new Promise((resolve, reject) => {
    sharp(filePath)
      .raw()
      .ensureAlpha()
      .resize(size, size, { fit: 'inside' })
      .toBuffer((err, buffer, { width, height }) => {
        if (err) return reject(err);
        resolve(
          encode(
            new Uint8ClampedArray(buffer),
            width,
            height,
            xComponents,
            yComponents
          )
        );
      });
  });
};
