export type UploadID = string | number
export type Metadata = {
  [key: string]: string | number | boolean
}

export interface File {
  id?: string
  localUri?: string
  uri: string
  fileName?: string | null
  contentType?: string
  width?: number
  height?: number
  metadata?: Metadata
}

export interface Upload {
  id: string
  file: File
  signedId: null | string
  uploading: boolean
  error?: string | any
}

export interface UseUploadOptions {
  multiple?: boolean
  onUploadAdd?: (upload: Upload) => void
  onUploadChange?: (upload: Upload) => void
  onUploadSuccess?: (upload: Upload) => void
}

export type UploRequestHeaders = Record<string, string>

export interface UploRequestOptions {
  /**
   * Extra headers for requests to your server (e.g. `Authorization`). A
   * function runs before each request, so it can return a fresh token. Not sent
   * to the storage provider.
   */
  headers?: UploRequestHeaders | (() => UploRequestHeaders | Promise<UploRequestHeaders>)
  /** `fetch` credentials for requests to your server, e.g. `'include'` for cookies on another domain. */
  credentials?: RequestCredentials
}
