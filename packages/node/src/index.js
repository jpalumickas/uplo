import Signer from './signer';
import attachFile from './attachFile';
import generateBlobKey from './generateBlobKey';

const defaultConfig = {
  privateKey: process.env.UPLOADER_SECRET,
  signedIdExpiresIn: 60 * 60,
};

const uploader = ({ service, adapter, config: providedConfig }) => {
  const config = Object.assign({}, defaultConfig, providedConfig);
  const signer = Signer(config);

  return {
    signer,
    adapter,
    service,
    generateBlobKey,
    attachFile: attachFile({ service, adapter, signer }),
  };
};

export default uploader;
