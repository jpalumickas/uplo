import { contentDisposition as generate } from '@tinyhttp/content-disposition';

export type ContentDispositionType = 'attachment' | 'inline';

export const contentDisposition = ({
  fileName,
  type = 'inline',
}: {
  fileName: string;
  type?: ContentDispositionType;
}) => {
  return generate(fileName, { type });
};
