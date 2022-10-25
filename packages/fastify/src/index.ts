import { FastifyPluginAsync } from 'fastify';
import { Uplo } from '@uplo/node';

export interface UploPluginOptions {
  mountPath?: string;
  uplo: Uplo;
}

const createDirectUploadOptions = {
  schema: {
    body: {
      type: 'object',
      required: ['attachmentName', 'fileName', 'contentType', 'checksum', 'size'],
      properties: {
        attachmentName: { type: 'string' },
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
  attachmentName: `${string}.${string}`;
  fileName: string;
  contentType: string;
  size: number;
  checksum: string;
  metadata?: {
    [key: string]: number | string;
  };
}

const fastifyPlugin: FastifyPluginAsync<UploPluginOptions> = async (fastify, { uplo, mountPath = '/uploads' }) => {
  fastify.decorate('uplo', uplo);

  fastify.post<{ Body: CreateDirectUploadBody}>(`${mountPath}/create-direct-upload`, createDirectUploadOptions, async (request, reply) => {
    const attachmentName = request.body['attachmentName'];
    const attachment = uplo.$findGenericAttachment(attachmentName);

    if (!attachment) {
      reply.send({ error: { message: `Cannot find attachment ${attachmentName}`} }).status(422);
      return;
    }

    const params = {
      fileName: request.body['fileName'],
      contentType: request.body['contentType'],
      size: request.body['size'],
      checksum: request.body['checksum'],
      metadata: request.body['metadata'],
    };

    const data = await attachment.createDirectUpload({ params });

    reply.send(data).status(201);
  })
}

export default fastifyPlugin;
