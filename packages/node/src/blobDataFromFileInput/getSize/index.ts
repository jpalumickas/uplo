import { lstatSync } from 'fs';

export const getSize = (input: any): number | undefined => {
  if (input === null || input === undefined) {
    return 0;
  }

  if (typeof input.path === "string") {
    try {
      return lstatSync(input.path || input).size;
    } catch (error) {
      return undefined;
    }
  } else if (typeof input.byteLength === "number") {
    return input.byteLength;
  } else if (typeof input.length === "number") {
    return input.length;
  } else if (typeof input.size === "number") {
    return input.size;
  }

  return undefined;
};
