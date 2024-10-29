import type { Blob, ID } from '@uplo/types';

export type BeforeAttachCallback = ({
  blobId,
}: {
  blobId: ID;
}) => void | Promise<void>;
export type AfterAttachCallback = ({
  blob,
}: {
  blob: Blob;
}) => void | Promise<void>;

export type Callbacks = {
  beforeAttach?: BeforeAttachCallback;
  afterAttach?: AfterAttachCallback;
};
