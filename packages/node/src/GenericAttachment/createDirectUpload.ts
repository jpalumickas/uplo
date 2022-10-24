import { Adapter, Service } from '@uplo/types';
import { generateKey } from '@uplo/utils';
import { UploError } from '../errors';
import { SignerResult, CreateDirectUploadParams } from '../types';

type Options = {
  params: CreateDirectUploadParams;
  signer: SignerResult;
  adapter: Adapter;
  service: Service;
  serviceName: string;
}

export const createDirectUpload = async  ({ params, signer, adapter, service, serviceName }: Options) => {
  const blobParams = {
    key: generateKey(),
    fileName: params.fileName,
    contentType: params.contentType,
    size: params.size,
    checksum: params.checksum,
    metadata: params.metadata,
  };

  const blob = await adapter.createBlob({
    params: {
      ...blobParams,
      serviceName,
    },
  });

  const uploadData = {
    url: await service.directUploadUrl(blob),
    headers: service.directUploadHeaders ? await service.directUploadHeaders(blob) : {},
  }

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
