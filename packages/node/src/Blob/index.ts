import {
  Service,
  Adapter,
  Blob as TBlob,
  BlobUrlOptions,
  BlobData,
} from '@uplo/types';

type Params = {
  data: BlobData;
  service: Service;
  adapter: Adapter;
};

export const Blob = ({ data: blobData, service, adapter }: Params): TBlob => {
  const { serviceName, ...data } = blobData;

  return {
    ...data,
    data: blobData,
    service,
    serviceName,
    protocolUrl: () => service.protocolUrl(blobData),
    url: async (opts: BlobUrlOptions = {}) => {
      if (service.isPublic) {
        return service.publicUrl(blobData);
      } else {
        return service.privateUrl(blobData, opts);
      }
    },
    updateMetadata: async (metadata: BlobData['metadata']) => {
      await adapter.updateBlobMetadata({ key: blobData.key, metadata });
    },
  };
};
