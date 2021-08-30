import { Blob } from '@uplo/types';

export type BeforeAttachCallback = ({ blobId }: { blobId: String | Number }) => void;
export type AfterAttachCallback = ({ blob }: { blob: Blob }) => void;

export type Callbacks = {
  beforeAttach?: BeforeAttachCallback;
  afterAttach?: AfterAttachCallback;
}
