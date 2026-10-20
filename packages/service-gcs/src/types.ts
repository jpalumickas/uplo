import type { StorageOptions } from '@google-cloud/storage'

import type { BlobStoragePath } from '@uplo/types'

export interface Options {
  isPublic?: boolean
  bucket: string
  credentialsPath?: string
  credentials?: StorageOptions['credentials']
  projectId?: string
  /** Default path in the bucket for new files. Attachment `storagePath` takes priority. */
  storagePath?: BlobStoragePath
  /**
   * Refuse direct uploads with a different size than declared.
   * Requires `x-goog-content-length-range` in bucket CORS `responseHeader`.
   * @default false
   */
  enforceContentLength?: boolean
}
