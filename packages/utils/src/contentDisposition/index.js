import { contentDisposition as generate } from '@tinyhttp/content-disposition';

const contentDisposition = ({ filename, type = 'inline' }) => {
  return generate(filename, { type });
};

export default contentDisposition;
