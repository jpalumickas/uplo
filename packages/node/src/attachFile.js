import { upperFirst, camelCase } from 'lodash';

const attachFile = ({ service, adapter, signer }) => async ({
  signedId,
  modelName,
  modelId,
  name,
  strategy = 'many',
  ...rest
}) => {
  const { blobId } = await signer.verify(signedId, 'blob');
  const recordType = upperFirst(camelCase(modelName));

  const blob = await adapter.findBlob(blobId);

  await service.updateMetadata(blob.key, { contentType: blob.contentType });

  return await service.attachBlob({
    blob,
    recordId: modelId,
    recordType,
    strategy,
    ...rest,
  });
};

export default attachFile;
