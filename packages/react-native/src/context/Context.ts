import { createContext } from 'react'

import type { UploRequestOptions } from '../types'

export type UploContextType = {
  host: string
  mountPath?: string
} & UploRequestOptions

const defaultContext = {
  host: '',
  mountPath: '/uploads',
}

export const UploContext = createContext<UploContextType>(defaultContext)
export const { Consumer, Provider } = UploContext
