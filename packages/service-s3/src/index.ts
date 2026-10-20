import type { S3ClientConfig } from '@aws-sdk/client-s3'
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Readable } from 'node:stream'

import { UploError } from '@uplo/server'
import type { Service, BlobData, ServiceUploadParams, BlobStoragePath } from '@uplo/types'
import type { ContentDispositionType } from '@uplo/utils'
import { contentDisposition } from '@uplo/utils'

const DEFAULT_REGION = 'us-east-1'

interface Options {
  isPublic?: boolean
  bucket: string
  region?: S3ClientConfig['region']
  accessKeyId: string
  secretAccessKey: string
  endpoint?: S3ClientConfig['endpoint']
  forcePathStyle?: S3ClientConfig['forcePathStyle']
  requestHandler?: S3ClientConfig['requestHandler']
  /**
   * AWS SDK default (`WHEN_SUPPORTED`) signs a CRC32 of an empty body into
   * direct upload URLs, so uploads with a real body fail.
   * @default 'WHEN_REQUIRED'
   */
  requestChecksumCalculation?: S3ClientConfig['requestChecksumCalculation']
  /** @default 'WHEN_REQUIRED' */
  responseChecksumValidation?: S3ClientConfig['responseChecksumValidation']
  /** Send object ACL on uploads. Set `false` for providers without ACL support (e.g. Cloudflare R2). */
  acl?: boolean
  /** Base URL for public objects (e.g. CDN or custom domain). Used by `publicUrl()` as `${publicUrl}/${key}`. */
  publicUrl?: string
  /** Default path in the bucket for new files. Attachment `storagePath` takes priority. */
  storagePath?: BlobStoragePath
}

export const createS3Service = ({
  isPublic = false,
  bucket,
  accessKeyId,
  secretAccessKey,
  endpoint,
  region = DEFAULT_REGION,
  forcePathStyle,
  requestHandler,
  requestChecksumCalculation = 'WHEN_REQUIRED',
  responseChecksumValidation = 'WHEN_REQUIRED',
  acl = true,
  publicUrl: publicBaseUrl,
  storagePath,
}: Options): Service => {
  const s3Config: S3ClientConfig = {
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    region: region,
    endpoint,
    forcePathStyle,
    requestHandler,
    requestChecksumCalculation,
    responseChecksumValidation,
  }

  const objectAcl = acl ? (isPublic ? 'public-read' : 'private') : undefined

  const client = new S3Client(s3Config)

  return {
    isPublic,
    storagePath,
    async directUploadUrl(blob: BlobData) {
      const command = new PutObjectCommand({
        Bucket: bucket,
        // ContentDisposition: `attachment; filename="${fileName}"`,
        ContentLength: Number(blob.size),
        ContentType: blob.contentType,
        ContentMD5: blob.checksum,
        ACL: objectAcl,
        Key: blob.key,
      })

      return await getSignedUrl(client, command, {
        expiresIn: 300,
        // SDK leaves Content-Type unsigned by default, so a client could upload
        // with a different type than the validated one
        signableHeaders: new Set(['content-type']),
      })
    },

    async upload({ key, content, size, contentType, checksum }: ServiceUploadParams) {
      const parallelUploads3 = new Upload({
        client,
        partSize: 5242880, // 5MB
        leavePartsOnError: false, // optional manually handle dropped parts
        params: {
          Bucket: bucket,
          Body: content,
          Key: key,
          ContentLength: Number(size),
          ContentType: contentType,
          ContentMD5: checksum,
          ACL: objectAcl,
        },
      })

      await parallelUploads3.done()
    },

    async delete({ key }: Pick<BlobData, 'key'>) {
      const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key })
      await client.send(cmd)

      return true
    },

    async createReadStream({ key }: { key: BlobData['key'] }) {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key })
      const s3Item = await client.send(command)
      if (s3Item.Body) {
        return s3Item.Body as Readable
      } else {
        throw new UploError('No body found when creating read stream')
      }
    },

    async directUploadHeaders(blob: BlobData) {
      const headers: Record<string, string> = {
        'Content-Type': blob.contentType,
        'Content-MD5': blob.checksum,
      }

      if (acl && isPublic) {
        headers['x-amz-acl'] = 'public-read'
      }

      return headers
    },

    async publicUrl({ key }: Pick<BlobData, 'key'>) {
      if (publicBaseUrl) {
        return `${publicBaseUrl.replace(/\/+$/, '')}/${key}`
      } else if (endpoint) {
        return `${endpoint}/${bucket}/${key}`
      } else {
        return `https://${bucket}.s3${region === DEFAULT_REGION ? '' : `.${region}`}.amazonaws.com/${key}`
      }
    },

    async privateUrl(
      blob: BlobData,
      {
        disposition,
        expiresIn = 300,
      }: { disposition?: ContentDispositionType; expiresIn?: number } = {},
    ) {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: blob.key,
        ResponseContentType: blob.contentType,
        ResponseContentDisposition:
          disposition &&
          contentDisposition({
            type: disposition,
            fileName: blob.fileName,
          }),
      })

      return await getSignedUrl(client, command, { expiresIn })
    },

    async protocolUrl(blob: BlobData) {
      return `s3://${bucket}/${blob.key}`
    },
  }
}
