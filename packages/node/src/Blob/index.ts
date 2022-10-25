import { Analyzer, Service, Adapter, Blob as TBlob, BlobData } from '@uplo/types';
import analyze from './analyze';
import { downloadToTempfile as downloadToTempfileFn } from './downloadToTempfile';

type Params = {
  data: BlobData;
  service: Service;
  adapter: Adapter;
  analyzers: Analyzer[];
}

export const Blob = ({
  data: blobData,
  service,
  adapter,
  analyzers,
}: Params): TBlob => {
  const { serviceName, ...data } = blobData;
  const downloadToTempfile = downloadToTempfileFn({ key: data.key, fileName: data.fileName, service });

  return {
    ...data,
    data: blobData,
    service,
    serviceName,
    downloadToTempfile,
    protocolUrl: () => service.protocolUrl(blobData),
    url: async () => {
      if (service.isPublic) {
        return service.publicUrl(blobData)
      } else {
        return service.privateUrl(blobData)
      }
    },
    analyze: () => analyze({ blobData, service, adapter, analyzers }),
  }
}
