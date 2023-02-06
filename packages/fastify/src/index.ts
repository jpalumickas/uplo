import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin'
import { Uplo, UploOptionsAttachments } from '@uplo/node';

export interface UploPluginOptions<AttachmentsList extends UploOptionsAttachments> {
  mountPath?: string;
  uplo: Uplo<AttachmentsList>;
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

// @ts-ignore
const fastifyPlugin: FastifyPluginAsync<UploPluginOptions> = async (fastify, opts) => {
  const options = typeof opts === 'function' ? await opts(fastify) : opts;

  const { uplo } = options

  fastify.decorate('uplo', uplo);

  const mountPath = options.mountPath || '/uploads'

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

export default fp(fastifyPlugin);
