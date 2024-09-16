import { useContext } from 'react';
import { UploContext } from '../context/UploContext';

export const useUploConfig = () => {
  const config = useContext(UploContext);

  if (!config) {
    throw new Error('useUploConfig must be used within a UploProvider');
  }

  const mountPath = config.mountPath || '/uploads';

  const uploadsUrl = `${config.host}${mountPath}`;

  return {
    ...config,
    mountPath,
    uploadsUrl,
  };
};
