import type { Blob, ID } from '@uplo/types';

export type BeforeAttachCallback = ({ blobId }: { blobId: ID }) => void;
export type AfterAttachCallback = ({ blob }: { blob: Blob }) => void;

export type Callbacks = {
  beforeAttach?: BeforeAttachCallback;
  afterAttach?: AfterAttachCallback;
};
