import { Service, Adapter, Analyzer } from '@uplo/types';
import { Callbacks, Config, UploOptions, CreateDirectUploadParams, UploInstance } from './types';
import createSigner from './signer';
import attachSignedFile from './attachSignedFile';
import analyze from './analyze';
import createDirectUpload from './createDirectUpload';

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
}: UploOptions
): UploInstance => {
  const config = Object.assign({}, defaultConfig, providedConfig);
  const signer = createSigner(config);

  return {
    signer,
    adapter,
    service,
    attachSignedFile: attachSignedFile({ service, adapter, signer, callbacks }),
    analyze: analyze({ service, adapter, analyzers }),
    createDirectUpload: ({ params }: { params: CreateDirectUploadParams }) => createDirectUpload({ params, signer, adapter, service }),
  };
};

export * from '@uplo/types';
export * from './types';
export default uploader;
