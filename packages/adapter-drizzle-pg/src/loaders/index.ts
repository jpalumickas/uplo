import { DrizzleAdapterOptions } from '..';
import { findAttachmentsLoader } from './findAttachments';
import { findBlobLoader } from './findBlob';

export const loaders = (options: DrizzleAdapterOptions) => {
  return {
    findAttachments: findAttachmentsLoader(options),
    findBlob: findBlobLoader(options),
  };
};
