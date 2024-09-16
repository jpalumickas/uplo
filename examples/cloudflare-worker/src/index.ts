import Uplo, { BlobInput, blobStringInput } from '@uplo/server';
import S3Service from '@uplo/service-s3';
import { DrizzleAdapter } from '@uplo/adapter-drizzle-pg';
import { initDB, schema } from './db';
import { checksumString } from '@uplo/utils';
// import GCSService from '@uplo/service-gcs'

export interface Env {
  AWS_ENDPOINT: string;
  AWS_BUCKET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  DATABASE_URL: string;
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
}

const imageUrlToBlobInput = async (url: string): Promise<BlobInput> => {
  const data = await fetch(url);
  const arrayBuffer = await data.arrayBuffer();
  const content = new Uint8Array(arrayBuffer);
  // const base64 = btoa(String.fromCharCode());
  const contentType = data.headers.get('content-type');

  if (!contentType) {
    throw new Error('Cannot get content type from image');
  }

  return {
    fileName: 'image.jpg',
    size: content.length,
    contentType,
    checksum: await checksumString(content),
    content: content,
  };
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const { db } = await initDB({
      databaseUrl: env.DATABASE_URL,
    });

    const s3Service = S3Service({
      isPublic: false,
      bucket: env.AWS_BUCKET,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    });

    const uplo = Uplo({
      adapter: DrizzleAdapter({
        db,
        schema,
      }),
      services: {
        s3: s3Service,
      },
      attachments: {
        user: {
          avatar: true,
        },
      },
    });

    // const service = GCSService({})

    const blobInput = await imageUrlToBlobInput(
      'https://www.viewbug.com/media/mediafiles/2015/10/16/59560665_medium.jpg'
    );
    await uplo.attachments.user(1).avatar.attachFile(blobInput);

    const userAttachment = await uplo.attachments.user(1).avatar.findOne();

    console.log(userAttachment);

    const avatarUrl = userAttachment?.url();
    return new Response(`User avatar url: ${avatarUrl}`);
  },
};
