import { contentDisposition as generate } from '@tinyhttp/content-disposition';

type ContentDispositionType = 'attachment' | 'inline';

const contentDisposition = ({ filename, type = 'inline' }: { filename: string, type: ContentDispositionType }) => {
  return generate(filename, { type });
};

export default contentDisposition;
