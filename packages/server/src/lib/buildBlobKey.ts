import mime from 'mime'

import type { BlobStoragePath, Service } from '@uplo/types'
import { generateKey } from '@uplo/utils'

import { UploError } from '../errors.js'

type Params = {
  service: Service
  /** Attachment storagePath, takes priority over service storagePath */
  storagePath?: BlobStoragePath
  serviceName: string
  modelName: string
  attachmentName: string
  fileName: string
  contentType: string
}

export const getFileExtension = ({
  fileName,
  contentType,
}: {
  fileName: string
  contentType: string
}) => {
  const baseName = fileName.split(/[\\/]/).pop() ?? ''
  const dotIndex = baseName.lastIndexOf('.')

  // Ignore dotfiles like ".env" and names ending with a dot
  if (dotIndex > 0 && dotIndex < baseName.length - 1) {
    return baseName.slice(dotIndex + 1).toLowerCase()
  }

  return mime.getExtension(contentType) ?? undefined
}

export const buildBlobKey = async ({ service, storagePath, ...params }: Params) => {
  const key = await generateKey()
  const storagePathFn = storagePath ?? service.storagePath

  if (!storagePathFn) {
    return key
  }

  const result = await storagePathFn({
    ...params,
    key,
    extension: getFileExtension(params),
  })

  // S3 and GCS treat a leading slash as an empty folder name
  const formattedKey = typeof result === 'string' ? result.replace(/^\/+/, '') : ''

  if (!formattedKey) {
    throw new UploError('Attachment or service `storagePath` must return a non-empty string')
  }

  return formattedKey
}
