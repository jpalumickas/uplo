import { BlobNotFoundError } from '@uplo/server'
import type {
  CreateBlobOptions,
  AttachBlobOptions,
  Adapter,
  Blob,
  BlobData,
  AttachmentData,
} from '@uplo/types'

import { initFindAttachmentsLoader } from './loaders/findAttachments'
import type { PrismaClient } from './types'

interface Options {
  prisma: PrismaClient
}

export const createPrismaAdapter = ({ prisma }: Options): Adapter => {
  const findAttachmentsLoader = initFindAttachmentsLoader(prisma)

  const findAttachments = async ({
    recordId,
    recordType,
    name,
  }: {
    recordId: string | number
    recordType: string
    name: string
  }): Promise<AttachmentData[]> => {
    return await findAttachmentsLoader.load({
      recordId,
      recordType,
      name,
    })
  }

  const deleteAttachment: Adapter['deleteAttachment'] = async ({
    id,
    recordId,
    recordType,
    name,
  }) => {
    try {
      const result = await prisma.fileAttachment.delete({
        where: {
          id: id as any,
          recordId: recordId as any,
          recordType,
          name,
        },
      })

      return result as AttachmentData
    } catch (err) {
      // P2025: no attachment matched all fields
      if ((err as { code?: string })?.code === 'P2025') {
        return null
      }
      throw err
    }
  }

  const findBlobAttachments: Adapter['findBlobAttachments'] = async (blobId) => {
    return (await prisma.fileAttachment.findMany({
      where: { blobId: blobId as any },
    })) as AttachmentData[]
  }

  const deleteAttachments = async ({
    recordId,
    recordType,
    name,
  }: {
    recordId: string | number
    recordType: string
    name: string
  }): Promise<Omit<AttachmentData, 'blob'>[]> => {
    const where = { recordId: recordId as any, recordType, name }
    const attachments = (await prisma.fileAttachment.findMany({ where })) as Omit<
      AttachmentData,
      'blob'
    >[]

    if (attachments.length === 0) {
      return []
    }

    // deleteMany only returns a count, so delete the found rows by ID and
    // return them
    await prisma.fileAttachment.deleteMany({
      where: { ...where, id: { in: attachments.map((attachment) => attachment.id as any) } },
    })

    return attachments
  }

  const findUnattachedBlobs: NonNullable<Adapter['findUnattachedBlobs']> = async ({
    olderThan,
    limit,
    afterId,
  }) => {
    return (await prisma.fileBlob.findMany({
      where: {
        createdAt: { lt: olderThan },
        attachments: { none: {} },
        ...(afterId === undefined ? {} : { id: { gt: afterId as any } }),
      },
      orderBy: { id: 'asc' },
      take: limit,
    })) as BlobData[]
  }

  const deleteUnattachedBlob: NonNullable<Adapter['deleteUnattachedBlob']> = async (id) => {
    const blob = (await prisma.fileBlob.findUnique({
      where: { id: id as any },
    })) as BlobData | null

    if (!blob) {
      return null
    }

    // One statement that deletes only when no attachment points to the blob
    const { count } = await prisma.fileBlob.deleteMany({
      where: { id: id as any, attachments: { none: {} } },
    })

    return count > 0 ? blob : null
  }

  const createBlob = async ({ params }: CreateBlobOptions): Promise<BlobData> => {
    const blob = (await prisma.fileBlob.create({
      data: {
        key: params.key,
        fileName: params.fileName,
        contentType: params.contentType,
        size: params.size,
        metadata: params.metadata || {},
        checksum: params.checksum,
        serviceName: params.serviceName,
      },
    })) as BlobData

    return blob
  }

  const findBlob = async (id: string | number): Promise<BlobData | null> => {
    return (await prisma.fileBlob.findUnique({
      where: { id: id as any },
    })) as BlobData | null
  }

  const findBlobByKey = async (key: Blob['key']) => {
    const blob = (await prisma.fileBlob.findUnique({
      where: { key },
    })) as BlobData | null

    return blob
  }

  const updateBlobMetadata = async ({
    key,
    metadata,
  }: {
    key: Blob['key']
    metadata: Blob['metadata']
  }) => {
    return prisma.$transaction(async (tx: any) => {
      const blob = await tx.fileBlob.findUnique({
        where: { key },
      })

      if (!blob) {
        throw new BlobNotFoundError(`Blob not found with key ${key}`)
      }

      const newMetadata = { ...blob.metadata, ...metadata }

      return (await tx.fileBlob.update({
        where: { key },
        data: { metadata: newMetadata },
      })) as BlobData
    })
  }

  const attachBlob = async ({
    blob,
    attachmentName,
    recordId,
    recordType,
    append = false,
  }: AttachBlobOptions) => {
    if (!append) {
      await prisma.fileAttachment.deleteMany({
        where: {
          name: attachmentName,
          recordType,
          recordId: recordId as any,
        },
      })
    }

    const result = await prisma.fileAttachment.create({
      data: {
        name: attachmentName,
        recordType,
        recordId: recordId as any,
        blob: { connect: { id: blob.id as any } },
      },
      include: { blob: true },
    })

    return result as AttachmentData
  }

  return {
    findAttachments,
    deleteAttachment,
    findBlobAttachments,
    deleteAttachments,
    findUnattachedBlobs,
    deleteUnattachedBlob,
    createBlob,
    findBlob,
    findBlobByKey,
    updateBlobMetadata,
    attachBlob,
  }
}
