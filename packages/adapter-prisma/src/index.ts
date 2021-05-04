import { PrismaClient } from '@prisma/client';

export interface CreateBlobParams {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
  metadata?: object;
  checksum: string;
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

  return {
    prisma,
    createBlob,
  };
};

export default prismaAdapter;
