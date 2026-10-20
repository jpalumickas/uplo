import type { GetSignedUrlConfig, StorageOptions } from '@google-cloud/storage'
import { Storage } from '@google-cloud/storage'
import fs from 'node:fs'

import type { Service, ServiceUploadParams, BlobData, BlobStoragePath } from '@uplo/types'
import type { ContentDispositionType } from '@uplo/utils'
import { contentDisposition } from '@uplo/utils'

interface Options {
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

// GCS refuses PUT uploads with a different size (400 Bad Request).
// Min and max are the same, so the uploaded file must match the declared size.
const contentLengthRangeHeader = (blob: BlobData) => {
  const size = Number(blob.size)
  return { 'x-goog-content-length-range': `${size},${size}` }
}

export const createGCSService = ({
  isPublic = false,
  bucket,
  credentialsPath,
  credentials,
  projectId,
  storagePath,
  enforceContentLength = false,
}: Options): Service => {
  const storage = new Storage({
    keyFilename: credentialsPath,
    credentials,
    projectId,
  })

  const sizeHeaders = (blob: BlobData) =>
    enforceContentLength ? contentLengthRangeHeader(blob) : {}

  const directUploadHeaders = async (
    blob: BlobData,
    { disposition }: { disposition?: ContentDispositionType } = {},
  ) => {
    return {
      'Content-Type': blob.contentType,
      'Content-MD5': blob.checksum,
      ...sizeHeaders(blob),
      'Content-Disposition': contentDisposition({
        type: disposition,
        fileName: blob.fileName,
      }),
    }
  }

  const directUploadUrl = async (blob: BlobData, { expiresIn = 5 * 60 * 1000 } = {}) => {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + expiresIn,
      contentMd5: blob.checksum,
      contentType: blob.contentType, //'application/octet-stream',
      // Signed, so the client must send the same headers
      extensionHeaders: sizeHeaders(blob),
    }

    // Get a v4 signed URL for uploading file
    const [url] = await storage.bucket(bucket).file(blob.key).getSignedUrl(options)

    return url
  }

  const updateMetadata = async (
    key: string,
    {
      contentType,
      disposition,
      fileName,
    }: {
      contentType: string
      disposition?: ContentDispositionType
      fileName?: string
    },
  ): Promise<void> => {
    const metadata: { contentType?: string; contentDisposition?: string } = {}

    if (contentType) {
      metadata.contentType = contentType
    }

    if (disposition && fileName) {
      metadata.contentDisposition = contentDisposition({
        type: disposition,
        fileName,
      })
    }

    await storage.bucket(bucket).file(key).setMetadata(metadata)
  }

  const publicUrl = async (blob: BlobData) => {
    return await storage.bucket(bucket).file(blob.key).publicUrl()
  }

  const privateUrl = async (
    blob: BlobData,
    {
      disposition,
      expiresIn = 300,
    }: { disposition?: ContentDispositionType; expiresIn?: number } = {},
  ) => {
    const options: GetSignedUrlConfig = {
      action: 'read',
      version: 'v4',
      expires: Date.now() + expiresIn * 1000,
      responseType: blob.contentType,
      responseDisposition:
        disposition &&
        contentDisposition({
          type: disposition,
          fileName: blob.fileName,
        }),
    }

    // Get a v4 signed URL for uploading file
    const [url] = await storage.bucket(bucket).file(blob.key).getSignedUrl(options)

    return url
  }

  const upload = async ({ key, content, contentType }: ServiceUploadParams) => {
    const file = storage.bucket(bucket).file(key)

    if (content instanceof fs.ReadStream) {
      return new Promise((resolve, reject) => {
        content
          .pipe(
            file.createWriteStream({
              resumable: false,
              metadata: { contentType },
            }),
          )
          .on('error', (err) => {
            reject(err)
          })
          .on('finish', (e: any) => {
            resolve(e)
          })
      })
    } else if (content instanceof globalThis.Blob) {
      throw new Error('Blob not implemented')
    } else if (content instanceof ReadableStream) {
      throw new Error('ReadableStream not implemented')
    }

    return await file.save(content)
  }

  const createReadStream = async ({ key }: { key: BlobData['key'] }) => {
    return storage.bucket(bucket).file(key).createReadStream()
  }

  const del = async ({ key }: { key: BlobData['key'] }) => {
    await storage.bucket(bucket).file(key).delete()
    return true
  }

  const protocolUrl = async (blob: BlobData) => {
    return `gs://${bucket}/${blob.key}`
  }

  return {
    isPublic,
    storagePath,
    directUploadUrl,
    directUploadHeaders,
    updateMetadata,
    publicUrl,
    privateUrl,
    upload,
    createReadStream,
    delete: del,
    protocolUrl,
  }
}
