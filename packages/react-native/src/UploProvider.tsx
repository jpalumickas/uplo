import React from 'react';
import { Provider } from './Context';

export interface UploProviderProps {
  children: React.ReactNode;
  host: string;
  mountPath?: string;
}

export const UploProvider: React.FC<UploProviderProps> = ({ host, mountPath, children }) => (
  <Provider value={{ host, mountPath }}>{children}</Provider>
);
