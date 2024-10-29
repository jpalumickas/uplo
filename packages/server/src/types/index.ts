import type { ID, Blob, Service, Adapter } from '@uplo/types';
import type { Signer } from '../Signer';
import type { ModelAttachment } from '../ModelAttachment';
import type { GenericAttachment } from '../GenericAttachment';
import type { UploOptionsAttachments } from './config';

export type * from './callbacks.js';
export type * from './config.js';

export type UploAttachments<AttachmentsList> = {
  [ModelName in keyof AttachmentsList]: (id: ID) => {
    [AttachmentName in keyof AttachmentsList[ModelName]]: ModelAttachment;
  };
};

export interface UploInstance<AttachmentsList extends UploOptionsAttachments> {
  signer: ReturnType<typeof Signer>;
  adapter: Adapter;
  $services: Record<string, Service>;
  $findBlob: (id: ID) => Promise<Blob | null>;
  $findGenericAttachment: (
    name: `${string}.${string}`
  ) => ReturnType<typeof GenericAttachment>;

  attachments: UploAttachments<AttachmentsList>;
}
