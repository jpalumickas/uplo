import { useContext } from 'react';
import Context from './Context';

const useConfig = () => {
  const config = useContext(Context);
  const mountPath = config.mountPath || '/uploads';

  const uploadsUrl = `${config.host}${mountPath}`;

  return {
    ...config,
    mountPath,
    uploadsUrl,
  }
}


export default useConfig;
