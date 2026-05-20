import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import PrismaAdapter from '@uplo/adapter-prisma'
import Uplo from '@uplo/node'
import S3Service from '@uplo/service-s3'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export const uplo = Uplo({
  adapter: new PrismaAdapter({ prisma }),
  services: {
    s3: S3Service({
      isPublic: false,
      endpoint: process.env.S3_ENDPOINT!,
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      bucket: process.env.S3_BUCKET!,
      forcePathStyle: true,
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
})
