import { basename } from 'path';

export const getFileName = (input: any): string | undefined => {
  // File path
  if (typeof input === 'string') {
    return basename(input);
  } else if (typeof input.path === "string") {
    return basename(input.path);
  }

  return undefined;
}
