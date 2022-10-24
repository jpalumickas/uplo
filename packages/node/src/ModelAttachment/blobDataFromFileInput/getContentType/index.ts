import { basename } from 'path';
import mime from 'mime/lite';

export const getContentType = (input: any): string | undefined => {
  if (typeof input.path === "string") {
    const fileName = basename(input.path || input);
    return mime.getType(fileName) || undefined;
  }

  return undefined;
}
