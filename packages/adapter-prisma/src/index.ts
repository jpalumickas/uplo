import { PrismaClient } from '@prisma/client';

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

// TODO: Make serviceName to get from uploader service
const prismaAdapter = ({ prisma }: { prisma: PrismaClient }) => {
  const createBlob = async ({ params }: { params: CreateBlobParams }) => {
    const blob = await prisma.activeStorageBlob.create({
      data: {
        key: params.key,
        filename: params.fileName,
        contentType: params.contentType,
        byteSize: params.size,
        metadata: JSON.stringify(params.metadata || {}),
        checksum: params.checksum,
        serviceName: 'google',
      },
    });

    return blob;
  };

  const findBlob = async (id: string | number) => {
    return await prisma.fileBlob.findUnique({
      where: { id },
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
    createBlob,
  };
};

export default prismaAdapter;
