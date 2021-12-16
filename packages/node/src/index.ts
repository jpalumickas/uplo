import _ from 'lodash';
import {
  UploOptions,
  CreateDirectUploadParams,
  UploInstance,
  Attachment,
  UploOptionsAttachment
} from './types';
import createSigner from './signer';
import attachSignedFile from './attachSignedFile';
import analyze from './analyze';
import createDirectUpload from './createDirectUpload';
import ModelAttachment from './modelAttachment';

const defaultConfig = {
  privateKey: process.env.UPLOADER_SECRET,
  signedIdExpiresIn: 60 * 60,
};

const uploader = ({
  service,
  adapter,
  config: providedConfig,
  analyzers = [],
  callbacks = {},
  attachments = {},
}: UploOptions): UploInstance => {
  const config = Object.assign({}, defaultConfig, providedConfig);
  const signer = createSigner(config);
  console.log('bb');

  return {
    signer,
    adapter,
    service,
    attachSignedFile: attachSignedFile({ service, adapter, signer, callbacks }),
    analyze: analyze({ service, adapter, analyzers }),
    createDirectUpload: ({ params }: { params: CreateDirectUploadParams }) =>
      createDirectUpload({ params, signer, adapter, service }),
    attachments: _.reduce<
      any,
      { [modelName: keyof typeof attachments]: { [attachmentName: string]: Attachment } }
    >(
      attachments,
      (result, modelAttachments, modelName) => {
        console.log({ modelAttachments, modelName });

        result[modelName] = _.reduce<any, { [attachmentName: string]: Attachment }>(modelAttachments, (r, attachmentOptions: UploOptionsAttachment, attachmentName) => {
          const options = attachmentOptions === true ? {} : attachmentOptions;

          console.log('aa', attachmentName);

          r[attachmentName] = new ModelAttachment({
            modelName,
            attachmentName,
            multiple: options.multiple ?? false,
            service,
            adapter,
            signer,
            callbacks,
          })
          return r;
        }, {});
        console.log({ result });
        return result;
      },
      {}
    ),
  };
};

export * from '@uplo/types';
export * from './types';
export default uploader;
