import { basename } from 'path';
import mime from 'mime/lite';

export const getContentType = (input: any): string | undefined => {
  if (typeof input === "string" || typeof input.path === "string") {
    const fileName = basename(input.path || input);
    return mime.getType(fileName) || undefined;
  } else if (input instanceof Blob && input.type) {
    return input.type;
  }

  return undefined;
}
