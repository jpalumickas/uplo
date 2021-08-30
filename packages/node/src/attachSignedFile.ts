import { upperFirst, camelCase } from 'lodash';
import { Service, Adapter } from '@uplo/types';
import { Callbacks, SignerResult } from './types';

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
  const data = await signer.verify(signedId, 'blob');
  if (!data || !data.blobId) {
    throw new Error(`[Uplo] Cannot verify signed id for blob: ${signedId}`);
  }
  const { blobId } = data;

  if (callbacks.beforeAttach) {
    await callbacks.beforeAttach({ blobId });
  }

  const recordType = upperFirst(camelCase(modelName));

  const blob = await adapter.findBlob(blobId);

  if (!blob) {
    throw new Error(`[Uplo] Cannot find blob with id ${blobId}`);
  }

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
