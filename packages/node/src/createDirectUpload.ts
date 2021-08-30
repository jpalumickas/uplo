import { Adapter, Service } from '@uplo/types';
import generateBlobKey from './generateBlobKey';
import { SignerResult, CreateDirectUploadParams } from './types';

type Options = {
  params: CreateDirectUploadParams;
  signer: SignerResult;
  adapter: Adapter;
  service: Service;
}

const createDirectUpload = async  ({ params, signer, adapter, service }: Options) => {
  const blobParams = {
    key: generateBlobKey(),
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
    throw new Error(`[Uplo] failed to create signed id for direct upload`);
  }

  return {
    signedId: signedId,
    upload: uploadData,
  };
}

export default createDirectUpload;
