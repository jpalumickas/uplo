import { BlobNotFoundError } from '@uplo/server'
import type {
  CreateBlobOptions,
  AttachBlobOptions,
  Adapter,
  Blob,
  BlobData,
  ID,
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

  const deleteAttachment = async (id: ID): Promise<AttachmentData | null> => {
    const result = await prisma.fileAttachment.delete({
      where: {
        id: id as any,
      },
    })

    return result as AttachmentData
  }

  const deleteAttachments = async ({
    recordId,
    recordType,
    name,
  }: {
    recordId: string | number
    recordType: string
    name: string
  }): Promise<AttachmentData[]> => {
    const result = await prisma.fileAttachment.deleteMany({
      where: {
        recordId: recordId as any,
        recordType,
        name,
      },
    })

    return result as unknown as AttachmentData[]
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
    deleteAttachments,
    createBlob,
    findBlob,
    findBlobByKey,
    updateBlobMetadata,
    attachBlob,
  }
}
