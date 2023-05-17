import { getDeepValue } from '@uplo/utils';
import { ID } from '@uplo/types';
import {
  UploOptions,
  Uplo as TUplo,
  UploOptionsAttachments,
  UploOptionsAttachment,
} from './types';
import { UploError, AttachmentNotFoundError } from './errors';
import { Signer } from './Signer';
import { ModelAttachment } from './ModelAttachment';
import { Blob } from './Blob';
import { GenericAttachment } from './GenericAttachment';
import { formatAttachmentOptions } from './lib/formatAttachmentOptions';
import { defaultConfig } from './lib/defaultConfig';

const Uplo = <AttachmentsList extends UploOptionsAttachments>({
  services = {},
  defaultServiceName,
  adapter,
  config: providedConfig,
  analyzers = [],
  callbacks = {},
  attachments,
}: UploOptions<AttachmentsList>): TUplo<AttachmentsList> => {
  const config = Object.assign({}, defaultConfig, providedConfig);
  const signer = Signer(config);

  const findBlob = async (blobId: ID) => {
    const blobData = await adapter.findBlob(blobId);
    if (!blobData) return null;

    const service = services[blobData.serviceName];
    if (!service) {
      throw new UploError(
        `Cannot find service with name ${blobData.serviceName}`
      );
    }

    return Blob({ data: blobData, adapter: adapter, service, analyzers });
  };

  const modelAttachments = Object.keys(attachments).reduce(
    (result, modelName) => {
      const modelAttachments = attachments[modelName];

      // @ts-ignore
      result[modelName] = (modelId: ID) =>
        Object.keys(modelAttachments!).reduce((r, attachmentName) => {
          const attachmentOptions = modelAttachments![
            attachmentName
          ] as UploOptionsAttachment;
      // @ts-ignore
          r[attachmentName] = new ModelAttachment({
            modelId,
            modelName,
            attachmentName,
            options: formatAttachmentOptions({
              attachmentOptions,
              services,
              defaultServiceName,
            }),
            services,
            adapter,
            signer,
            callbacks,
            analyzers,
          });
          return r;
        }, {});
      return result;
    },
    {}
  );

  return {
    signer,
    adapter,
    $services: services,
    $findBlob: findBlob,
    $findGenericAttachment: (name: `${string}.${string}`) => {
      const attachmentOptions = getDeepValue(attachments, name, null);
      if (!attachmentOptions) {
        throw new AttachmentNotFoundError(
          `Attachment with name ${name} not found`
        );
      }
      return GenericAttachment({
        signer,
        adapter,
        services,
        options: formatAttachmentOptions({
          attachmentOptions,
          services,
          defaultServiceName,
        }),
      });
    },
    // @ts-ignore
    attachments: modelAttachments,
  };
};

export * from '@uplo/types';
export * from './types';
export * from './errors';

export default Uplo;
