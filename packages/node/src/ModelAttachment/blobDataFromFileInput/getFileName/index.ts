import { basename } from 'path';

export const getFileName = (input: any): string | undefined => {
  if (typeof input.path === "string") {
    return basename(input.path);
  }

  return undefined;
}
