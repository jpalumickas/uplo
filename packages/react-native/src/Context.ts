import { createContext } from 'react';

type ContextType = {
  host: string;
  mountPath?: string;
};

const defaultContext = {
  host: '',
  mountPath: '/uploads',
};

export const Context = createContext<ContextType>(defaultContext);
export const { Consumer, Provider } = Context;
