import React from 'react'

import type { UploRequestOptions } from '../types'
import { Provider } from './Context'

export interface UploProviderProps extends UploRequestOptions {
  children: React.ReactNode
  host: string
  mountPath?: string
}

export const UploProvider: React.FC<UploProviderProps> = ({
  host,
  mountPath,
  headers,
  credentials,
  children,
}) => <Provider value={{ host, mountPath, headers, credentials }}>{children}</Provider>
