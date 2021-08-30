import { Service, Adapter } from '@uplo/types';
import { Analyzer, Callbacks, Config } from './types';
import createSigner from './signer';
import attachSignedFile from './attachSignedFile';
import generateBlobKey from './generateBlobKey';
import analyze from './analyze';

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
}: {
  service: Service;
  adapter: Adapter;
  config?: Config;
  analyzers?: Analyzer[];
  callbacks?: Callbacks;
}) => {
  const config = Object.assign({}, defaultConfig, providedConfig);
  const signer = createSigner(config);

  return {
    signer,
    adapter,
    service,
    generateBlobKey,
    attachSignedFile: attachSignedFile({ service, adapter, signer, callbacks }),
    analyze: analyze({ service, adapter, analyzers }),
  };
};

export {
  Service,
  Adapter,
}

export default uploader;
