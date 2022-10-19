import _ from 'lodash';
import { getDeepValue } from '@uplo/utils';
import { ID } from '@uplo/types';
import {
  UploOptions,
  Uplo,
  UploOptionsAttachment,
} from './types';
import { AttachmentNotFoundError } from './errors';
import { Signer } from './signer';
import ModelAttachment from './ModelAttachment';
import { Blob } from './Blob';
import { GenericAttachment } from './GenericAttachment';
import { formatAttachmentOptions } from './lib/formatAttachmentOptions';

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
}: UploOptions): Uplo => {
  const config = Object.assign({}, defaultConfig, providedConfig);
  const signer = Signer(config);

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
            r[attachmentName] = new ModelAttachment({
              modelName,
              attachmentName,
              options: formatAttachmentOptions(attachmentOptions, services),
              services,
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
    $services: services,
    $findBlob: findBlob,
    $findGenericAttachment: (name: `${string}.${string}`) => {
      const attachmentOptions = getDeepValue(attachments, name, null)
      if (!attachmentOptions) {
        throw new AttachmentNotFoundError(`Attachment with name ${name} not found`);
      }
      return GenericAttachment({
        signer,
        adapter,
        services,
        options: formatAttachmentOptions(attachmentOptions, services),
      });
    },
    attachments: modelAttachments,
  };
};

export * from '@uplo/types';
export * from './types';
export * from './errors';

export default uploader;
