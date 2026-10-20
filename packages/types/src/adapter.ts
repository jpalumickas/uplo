import type { AttachmentData, BlobData } from './attachment'
import type { ID } from './general'

export interface CreateBlobParams {
  key: string
  fileName: string
  contentType: string
  size: number
  metadata?: object
  checksum: string
  serviceName: string
  [property: string]: any
}

export interface CreateBlobOptions {
  params: CreateBlobParams
}

export interface AttachBlobOptions {
  blob: BlobData
  attachmentName: string
  recordId: ID
  recordType: string
  append?: boolean
  returnQuery?: boolean
  [property: string]: any
}

export interface Adapter {
  findBlob(id: ID): Promise<BlobData | null>
  findBlobByKey(key: string): Promise<BlobData | null>
  attachBlob(options: AttachBlobOptions): Promise<AttachmentData>
  createBlob(options: CreateBlobOptions): Promise<BlobData>
  updateBlobMetadata({
    key,
    metadata,
  }: {
    key: BlobData['key']
    metadata: BlobData['metadata']
  }): Promise<BlobData | null>
  findAttachments(options: {
    recordId: AttachmentData['recordId']
    recordType: AttachmentData['recordType']
    name: AttachmentData['name']
  }): Promise<AttachmentData[]>
  /**
   * Deletes attachment only when all fields match, so an ID from another
   * record or attachment is not deleted. Returns null when nothing matched.
   */
  deleteAttachment(options: {
    id: ID
    recordId: AttachmentData['recordId']
    recordType: AttachmentData['recordType']
    name: AttachmentData['name']
  }): Promise<Omit<AttachmentData, 'blob'> | null>
  /** Returns all attachments of a blob, used to refuse attaching one blob to many records */
  findBlobAttachments(blobId: ID): Promise<Omit<AttachmentData, 'blob'>[]>
  deleteAttachments(options: {
    recordId: AttachmentData['recordId']
    recordType: AttachmentData['recordType']
    name: AttachmentData['name']
  }): Promise<Omit<AttachmentData, 'blob'>[]>
  /**
   * Optional, needed for `purgeUnattached`. Returns blobs with no attachments,
   * created before `olderThan`, ordered by `id`. With `afterId`, returns only
   * blobs with a greater `id`.
   */
  findUnattachedBlobs?(options: {
    olderThan: Date
    limit: number
    afterId?: ID
  }): Promise<BlobData[]>
  /**
   * Optional, needed to purge blobs. Deletes the blob row in one statement, only
   * when no attachment points to it. Returns null when nothing was deleted.
   */
  deleteUnattachedBlob?(id: ID): Promise<BlobData | null>
}
