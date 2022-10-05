import { Service, Adapter, AttachmentFile as TAttachmentFile, BlobData } from '@uplo/types';
// import analyze from './analyze';

type Params = {
  data: BlobData;
  service: Service;
  adapter: Adapter;
}

export const AttachmentFile = ({
  data: { service: serviceName, ...data },
  service,
}: Params): TAttachmentFile => {
  return {
    service,
    serviceName,
    protocolUrl: () => service.protocolUrl(data),
    url: () => service.url(data),
    // analyze: () => analyze(data),
    ...data,
  }
}
