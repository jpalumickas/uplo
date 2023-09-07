import { PrismaClient } from '@prisma/client';
import S3Service from '@uplo/service-s3';
import Uplo from '@uplo/node';
import PrismaAdapter from '@uplo/adapter-prisma';

const prisma = new PrismaClient();

export const uplo = Uplo({
  adapter: new PrismaAdapter({ prisma }),
  services: {
    s3: S3Service({
      endpoint: process.env.S3_ENDPOINT!,
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      bucket: process.env.S3_BUCKET!,
    }),
  },
  attachments: {
    user: {
      avatar: true,
      note: true,
      backgroundCovers: {
        multiple: true,
      },
    },
  },
});
