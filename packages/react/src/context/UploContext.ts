import { createContext } from 'react'

import type { UploRequestOptions } from '../types'

type ContextType = {
  host: string
  mountPath?: string
} & UploRequestOptions

const defaultContext = {
  host: '',
  mountPath: '/uploads',
}

export const UploContext = createContext<ContextType>(defaultContext)
export const { Consumer, Provider } = UploContext
