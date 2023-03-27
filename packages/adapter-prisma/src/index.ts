import { PrismaClient } from '@prisma/client';
import {
  CreateBlobOptions,
  AttachBlobOptions,
  Adapter,
  Blob,
  BlobData,
  ID,
  AttachmentData,
} from '@uplo/types';
import { BlobNotFoundError } from '@uplo/node';
import { initFindAttachmentsLoader } from './loaders/findAttachments';

class PrismaAdapter implements Adapter {
  prisma: PrismaClient;
  findAttachmentsLoader: ReturnType<typeof initFindAttachmentsLoader>;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
    this.findAttachmentsLoader = initFindAttachmentsLoader(prisma);

    this.createBlob = this.createBlob.bind(this);
  }

  async findAttachments({
    recordId,
    recordType,
    name,
  }: {
    recordId: string | number;
    recordType: string;
    name: string;
  }): Promise<AttachmentData[]> {
    return await this.findAttachmentsLoader.load({
      recordId,
      recordType,
      name,
    })
  }

  async deleteAttachment(id: ID): Promise<AttachmentData | null> {
    const result = await this.prisma.fileAttachment.delete({
      where: {
        id: id as string,
      },
    });

    return result as AttachmentData;
  }

  async deleteAttachments({
    recordId,
    recordType,
    name,
  }: {
    recordId: string | number;
    recordType: string;
    name: string;
  }): Promise<AttachmentData[]> {
    const result = await this.prisma.fileAttachment.deleteMany({
      where: {
        recordId: recordId as string,
        recordType,
        name,
      },
    });

    return result as unknown as AttachmentData[]
  }

  async createBlob({ params }: CreateBlobOptions): Promise<BlobData> {
    const blob = (await this.prisma.fileBlob.create({
      data: {
        key: params.key,
        fileName: params.fileName,
        contentType: params.contentType,
        size: params.size,
        metadata: params.metadata || {},
        checksum: params.checksum,
        serviceName: params.serviceName,
      },
    })) as BlobData;

    return blob;
  }

  async findBlob(id: string | number): Promise<BlobData | null> {
    return (await this.prisma.fileBlob.findUnique({
      where: { id: id as string },
    })) as BlobData | null;
  }

  async findBlobByKey(key: Blob['key']) {
    const blob = (await this.prisma.fileBlob.findUnique({
      where: { key },
    })) as BlobData | null;

    return blob;
  }

  async updateBlobMetadata({
    key,
    metadata,
  }: {
    key: Blob['key'];
    metadata: Blob['metadata'];
  }) {
    return this.prisma.$transaction(async (prisma: any) => {
      const blob = await prisma.fileBlob.findUnique({
        where: { key },
      });

      if (!blob) {
        throw new BlobNotFoundError(`Blob not found with key ${key}`);
      }

      const newMetadata = { ...blob.metadata, ...metadata };

      return (await prisma.fileBlob.update({
        where: { key },
        data: { metadata: newMetadata },
      })) as BlobData;
    });
  }

  async attachBlob({
    blob,
    attachmentName,
    recordId,
    recordType,
    append = false,
  }: AttachBlobOptions) {
    if (!append) {
      await this.prisma.fileAttachment.deleteMany({
        where: {
          name: attachmentName,
          recordType,
          recordId: recordId as string,
        },
      });
    }

    const result = await this.prisma.fileAttachment.create({
      data: {
        name: attachmentName,
        recordType,
        recordId: recordId as string,
        blob: { connect: { id: blob.id as string } },
      },
      include: { blob: true },
    });

    return result as AttachmentData;
  }
}

export default PrismaAdapter;
