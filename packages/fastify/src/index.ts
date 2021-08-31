import { FastifyPluginAsync } from 'fastify';
import { UploInstance } from '@uplo/node';

export interface UploPluginOptions {
  mountPath?: string;
  uplo: UploInstance;
}

const opts = {
  schema: {
    body: {
      type: 'object',
      required: ['fileName', 'contentType', 'checksum', 'size'],
      properties: {
        fileName: { type: 'string' },
        contentType: { type: 'string' },
        checksum: { type: 'string' },
        size: { type: 'number' },
        metadata: { type: 'object' },
      }
    }
  }
}

interface CreateDirectUploadBody {
  fileName: string;
  contentType: string;
  size: number;
  checksum: string;
  metadata?: {
    [key: string]: number | string;
  };
}

const fastifyPlugin: FastifyPluginAsync<UploPluginOptions> = async (fastify, { uplo, mountPath = '/uploads' }) => {
  fastify.post<{ Body: CreateDirectUploadBody}>(`${mountPath}/create-direct-upload`, opts, async (request, reply) => {

    const params = {
      fileName: request.body['fileName'],
      contentType: request.body['contentType'],
      size: request.body['size'],
      checksum: request.body['checksum'],
      metadata: request.body['metadata'],
    };

    const data = await uplo.createDirectUpload({ params });

    reply.send(data).status(201);
  })
}

export default fastifyPlugin;
