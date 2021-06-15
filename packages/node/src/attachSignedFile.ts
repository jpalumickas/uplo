import { upperFirst, camelCase } from 'lodash';
import { Service, Adapter, Callbacks } from './types';

export interface AttachFileOptions {
  signedId: string;
  modelName: string;
  modelId: string;
  attachmentName: string;
  strategy: 'one' | 'many';
}

const attachSignedFile = ({ service, adapter, signer, callbacks }: { service: Service, adapter: Adapter, callbacks: Callbacks }) => async ({
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

  const newBlob = await adapter.attachBlob({
    blob,
    attachmentName,
    recordId: modelId,
    recordType,
    strategy,
    ...rest,
  });

  if (callbacks.afterAttach) {
    await callbacks.afterAttach({ blob: newBlob });
  }

  return newBlob;
};

export default attachSignedFile;
