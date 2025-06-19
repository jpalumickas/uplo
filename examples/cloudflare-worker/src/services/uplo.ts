import Uplo from '@uplo/server';
import S3Service from '@uplo/service-s3';
import { DrizzleAdapter } from '@uplo/adapter-drizzle-pg';
import type { HonoContext } from '../types/hono.js';
import * as schema from '../db/schema.js';

export const createUplo = (c: HonoContext) => {
  const db = c.get('db');

  const s3Service = S3Service({
    isPublic: false,
    bucket: c.env.AWS_BUCKET,
    accessKeyId: c.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: c.env.AWS_SECRET_ACCESS_KEY,
    endpoint: c.env.AWS_ENDPOINT,
    requestHandler: {
      requestInit(_httpRequest: Request) {
        return { cache: undefined };
      },
    },
  });

  const uplo = Uplo({
    config: {
      privateKey: c.env.UPLO_SECRET_TOKEN,
    },
    adapter: DrizzleAdapter({
      db,
      schema,
    }),
    services: {
      s3: s3Service,
    },
    attachments: {
      user: {
        avatar: {
          directUpload: true,
          validate: {
            // contentType: ['image/png', 'image/jpeg'],
            contentType: /image\/\w/,
            size: {
              max: 1024 * 1024 * 5, // 5MB
            },
          },
        },
      },
    },
  });

  uplo.attachments.user(123);

  return uplo;
};
