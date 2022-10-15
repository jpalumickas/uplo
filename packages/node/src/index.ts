import _ from 'lodash';
import { getDeepValue } from '@uplo/utils';
import { ID } from '@uplo/types';
import {
  UploOptions,
  CreateDirectUploadParams,
  // UploInstance,
  // Attachment,
  UploOptionsAttachment,
} from './types';
import createSigner from './signer';
import createDirectUpload from './createDirectUpload';
import ModelAttachment from './modelAttachment';
import { Blob } from './Blob';

const defaultConfig = {
  privateKey: process.env.UPLOADER_SECRET,
  signedIdExpiresIn: 60 * 60,
};

const uploader = ({
  services,
  adapter,
  config: providedConfig,
  analyzers = [],
  callbacks = {},
  attachments = {},
}: UploOptions) => {
  const config = Object.assign({}, defaultConfig, providedConfig);
  const signer = createSigner(config);

  const findBlob = async (blobId: ID) => {
    const blobData = await adapter.findBlob(blobId);
    if (!blobData) return null;

    const service = services[blobData.service];
    return Blob({ data: blobData, adapter: adapter, service, analyzers });
  }

  const modelAttachments = _.reduce<
      any,
      {
        [modelName: keyof typeof attachments]: {
          [attachmentName: string]: ModelAttachment;
        };
      }
    >(
      attachments,
      (result, modelAttachments, modelName) => {
        result[modelName] = _.reduce<
          any,
          { [attachmentName: string]: ModelAttachment }
        >(
          modelAttachments,
          (r, attachmentOptions: UploOptionsAttachment, attachmentName) => {
            const options = attachmentOptions === true ? {} : attachmentOptions;
            const serviceName = options.service ? options.service : Object.keys(services)[0];

            r[attachmentName] = new ModelAttachment({
              modelName,
              attachmentName,
              options: {
                ...options,
                multiple: options.multiple ?? false,
                directUpload: options.directUpload ?? true,
                service: serviceName,
              },
              service: services[serviceName],
              adapter,
              signer,
              callbacks,
              analyzers,
            });
            return r;
          },
          {}
        );

        return result;
      },
      {}
    )

  return {
    signer,
    adapter,
    services,
    findBlob,
    // createDirectUpload: ({ params }: { params: CreateDirectUploadParams }) =>
    //   createDirectUpload({ params, signer, adapter, service }),
    findAttachmentByName: (name: `${string}.${string}`) => getDeepValue(modelAttachments, name, null),
    attachments: modelAttachments,
  };
};

export * from '@uplo/types';
export * from './types';
export * from './errors';

export default uploader;
