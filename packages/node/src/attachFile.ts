import { upperFirst, camelCase } from 'lodash';
import { Service, Adapter } from './types';

export interface AttachFileOptions {
  signedId: string;
  modelName: string;
  modelId: string;
  attachmentName: string;
  strategy: 'one' | 'many';
}

const attachFile = ({ service, adapter, signer }) => async ({
  signedId,
  modelName,
  modelId,
  attachmentName,
  strategy = 'many',
  ...rest
}: AttachFileOptions) => {
  const { blobId } = await signer.verify(signedId, 'blob');
  const recordType = upperFirst(camelCase(modelName));

  const blob = await adapter.findBlob(blobId);

  await service.updateMetadata(blob.key, { contentType: blob.contentType });

  return await adapter.attachBlob({
    blob,
    attachmentName,
    recordId: modelId,
    recordType,
    strategy,
    ...rest,
  });
};

export default attachFile;
