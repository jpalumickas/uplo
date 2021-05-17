import { Service, Adapter, Analyzer, Config } from './types';
import Signer from './signer';
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
}: {
  service: Service;
  adapter: Adapter;
  config: Config;
  analyzers: Analyzer[];
}) => {
  const config = Object.assign({}, defaultConfig, providedConfig);
  const signer = Signer(config);

  return {
    signer,
    adapter,
    service,
    generateBlobKey,
    attachSignedFile: attachSignedFile({ service, adapter, signer }),
    analyze: analyze({ service, adapter, analyzers }),
  };
};

export default uploader;
