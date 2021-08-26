import { upperFirst, camelCase } from 'lodash';
import { Service, Adapter, Callbacks, SignerResult } from './types';

export interface AttachFileOptions {
  signedId: string;
  modelName: string;
  modelId: string;
  attachmentName: string;
  strategy: 'one' | 'many';
}

interface AttachSignedFile {
  service: Service;
  adapter: Adapter;
  callbacks: Callbacks;
  signer: SignerResult;
}

const attachSignedFile = ({ service, adapter, signer, callbacks }: AttachSignedFile) => async ({
  signedId,
  modelName,
  modelId,
  attachmentName,
  strategy = 'many',
  ...rest
}: AttachFileOptions) => {
  const { blobId } = await signer.verify(signedId, 'blob');
  if (callbacks.beforeAttach) {
    await callbacks.beforeAttach({ blobId });
  }

  const recordType = upperFirst(camelCase(modelName));

  const blob = await adapter.findBlob(blobId);

  await service.updateMetadata(blob.key, { contentType: blob.contentType });

  const result = await adapter.attachBlob({
    blob,
    attachmentName,
    recordId: modelId,
    recordType,
    strategy,
    ...rest,
  });

  if (callbacks.afterAttach) {
    await callbacks.afterAttach({ blob });
  }

  return result;
};

export default attachSignedFile;
