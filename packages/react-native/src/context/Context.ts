import { createContext } from 'react';

export type UploContextType = {
  host: string;
  mountPath?: string;
};

const defaultContext = {
  host: '',
  mountPath: '/uploads',
};

export const UploContext = createContext<UploContextType>(defaultContext);
export const { Consumer, Provider } = UploContext;
