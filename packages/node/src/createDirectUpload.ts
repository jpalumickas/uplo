import { Adapter, Service } from '@uplo/types';
import { generateKey } from '@uplo/utils';
import { SignerResult, CreateDirectUploadParams } from './types';
import { UploError } from './errors';

type Options = {
  params: CreateDirectUploadParams;
  signer: SignerResult;
  adapter: Adapter;
  service: Service;
}

const createDirectUpload = async  ({ params, signer, adapter, service }: Options) => {
  const blobParams = {
    key: generateKey(),
    fileName: params.fileName,
    contentType: params.contentType,
    size: params.size,
    checksum: params.checksum,
    metadata: params.metadata,
  };

  const blob = await adapter.createBlob({
    params: blobParams,
    service: service,
  });

  const uploadData = await service.directUploadData(blob);

  const signedId = await signer.generate(
    { blobId: blob.id },
    'blob'
  );

  if (!signedId) {
    throw new UploError(`Failed to create Signed ID for direct upload`);
  }

  return {
    signedId: signedId,
    upload: uploadData,
  };
}

export default createDirectUpload;
