import { PrismaClient } from '@prisma/client';
import { Service } from '@uplo/node';

export interface CreateBlobParams {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
  metadata?: object;
  checksum: string;
}

export interface Blob {
  id: string | number;
  key: string;
}

export interface AttachBlobOptions {
  blob: Blob;
  attachmentName: string;
  recordId: string;
  recordType: string;
  strategy: 'one' | 'many';
  returnQuery: boolean;
}

const prismaAdapter = ({ prisma }: { prisma: PrismaClient }) => {
  const createBlob = async ({ params, service }: { params: CreateBlobParams, service: Service }) => {
    const blob = await prisma.fileBlob.create({
      data: {
        key: params.key,
        filename: params.fileName,
        contentType: params.contentType,
        size: params.size,
        metadata: params.metadata || {},
        checksum: params.checksum,
        serviceName: service.name()
      },
    });

    return blob;
  };

  const findBlob = async (id: string | number) => {
    return await prisma.fileBlob.findUnique({
      where: { id },
    });
  }

  const findBlobByKey = async (key: string) => {
    return await prisma.fileBlob.findUnique({
      where: { key },
    });
  }

  const updateBlobMetadata = async ({ key, metadata }: { key: string, metadata: object }) => {
    return await prisma.fileBlob.update({
      where: { key },
      data: { metadata }
    });
  }

  const attachBlob = async ({ blob, attachmentName, recordId, recordType, strategy, returnQuery = false }: AttachBlobOptions) => {
    if (strategy === 'one') {
      await prisma.fileAttachment.deleteMany({
        where: {
          name: attachmentName,
          recordType,
          recordId,
        },
      });
    }

    const query = prisma.fileAttachment.create({
      data: {
        name: attachmentName,
        recordType,
        recordId,
        blob: { connect: { id: blob.id } },
      },
    });

    if (returnQuery) {
      return { query };
    }

    return await query;
  }

  return {
    prisma,
    findBlob,
    findBlobByKey,
    attachBlob,
    createBlob,
    updateBlobMetadata,
  };
};

export default prismaAdapter;
