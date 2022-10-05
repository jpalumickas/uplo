import { PrismaClient } from '@prisma/client';
import { CreateBlobOptions, AttachBlobOptions, Adapter, Blob, ID } from '@uplo/types';
import { BlobNotFoundError } from '@uplo/node';

class PrismaAdapter extends Adapter {
  prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    super();
    this.prisma = prisma;
  }

  async findAttachments({ recordId, recordType, name }: { recordId: string | number, recordType: string, name: string }): Promise<Blob | null> {
    return await this.prisma.fileAttachment.findMany({
      where: {
        recordId,
        recordType,
        name,
      },
      orderBy: { createdAt: 'asc' },
      include: { blob: true }
    });
  }

  async deleteAttachment(id: ID): Promise<Blob | null> {
    return await this.prisma.fileAttachment.delete({
      where: {
        id
      },
    });
  }

  async deleteAttachments({ recordId, recordType, name }: { recordId: string | number, recordType: string, name: string }): Promise<Blob | null> {
    return await this.prisma.fileAttachment.deleteMany({
      where: {
        recordId,
        recordType,
        name,
      },
    });
  }

  async createBlob({ params, service }: CreateBlobOptions): Promise<Blob> {
    const blob = await this.prisma.fileBlob.create({
      data: {
        key: params.key,
        fileName: params.fileName,
        contentType: params.contentType,
        size: params.size,
        metadata: params.metadata || {},
        checksum: params.checksum,
        serviceName: service.name()
      },
    }) as Blob;

    return blob;
  };

  async findBlob (id: string | number): Promise<Blob | null> {
    return await this.prisma.fileBlob.findUnique({
      where: { id },
    }) as Blob | null;
  }

  async findBlobByKey(key: Blob['key']) {
    const blob = await this.prisma.fileBlob.findUnique({
      where: { key },
    }) as Blob | null;

    return blob;
  }

  async updateBlobMetadata({ key, metadata }: { key: Blob['key'], metadata: object }) {
    return this.prisma.$transaction(async (prisma) => {
      const blob = await prisma.fileBlob.findUnique({
        where: { key },
      });

      if (!blob) {
        throw new BlobNotFoundError(`Blob not found with key ${key}`);
      }

      const newMetadata = { ...blob.metadata, ...metadata };

      return await prisma.fileBlob.update({
        where: { key },
        data: { metadata: newMetadata }
      }) as Blob;
    });
  }

  async attachBlob({ blob, attachmentName, recordId, recordType, strategy }: AttachBlobOptions) {
    if (strategy === 'one') {
      await this.prisma.fileAttachment.deleteMany({
        where: {
          name: attachmentName,
          recordType,
          recordId,
        },
      });
    }

   return this.prisma.fileAttachment.create({
      data: {
        name: attachmentName,
        recordType,
        recordId,
        blob: { connect: { id: blob.id } },
      },
    });
  }
};

export default PrismaAdapter;
