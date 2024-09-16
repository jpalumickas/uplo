import { createContext } from 'react';

type ContextType = {
  host: string;
  mountPath?: string;
};

const defaultContext = {
  host: '',
  mountPath: '/uploads',
};

export const UploContext = createContext<ContextType>(defaultContext);
export const { Consumer, Provider } = UploContext;
