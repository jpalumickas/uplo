import type { FastifyPluginAsync, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'

import type { UploInstance, UploOptionsAttachments } from '@uplo/node'
import { NotFoundError, ValidationError } from '@uplo/node'

export interface UploPluginOptions<AttachmentsList extends UploOptionsAttachments> {
  mountPath?: string
  uplo: UploInstance<AttachmentsList>
}

const createDirectUploadOptions = {
  // Validation errors are returned as 422 by the handler, same as the Hono route
  attachValidation: true,
  schema: {
    body: {
      type: 'object',
      required: ['attachmentName', 'fileName', 'contentType', 'checksum', 'size'],
      properties: {
        attachmentName: {
          type: 'string',
          pattern: '^[a-z0-9-]+\\.[a-z0-9-]+$',
        },
        fileName: { type: 'string', minLength: 1 },
        contentType: { type: 'string', minLength: 1 },
        checksum: { type: 'string', minLength: 1 },
        size: { type: 'number', exclusiveMinimum: 0 },
      },
    },
  },
}

interface CreateDirectUploadBody {
  attachmentName: `${string}.${string}`
  fileName: string
  contentType: string
  size: number
  checksum: string
}

const sendError = (reply: FastifyReply, message: string) =>
  reply.status(422).send({ success: false, error: { message } })

const fastifyPlugin: FastifyPluginAsync<UploPluginOptions<UploOptionsAttachments>> = async (
  fastify,
  opts,
) => {
  const { uplo } = opts

  fastify.decorate('uplo', uplo)

  const mountPath = opts.mountPath || '/uploads'

  fastify.post<{ Body: CreateDirectUploadBody }>(
    `${mountPath}/create-direct-upload`,
    createDirectUploadOptions,
    async (request, reply) => {
      if (request.validationError) {
        return sendError(reply, request.validationError.message)
      }

      const { attachmentName, fileName, contentType, size, checksum } = request.body

      try {
        const attachment = uplo.$findGenericAttachment(attachmentName)

        // Client metadata is not passed on, so clients cannot set fields
        // like `analyzed` that analyzers write
        const data = await attachment.createDirectUpload({
          params: { fileName, contentType, size, checksum },
        })

        return reply.status(201).send(data)
      } catch (err) {
        if (err instanceof ValidationError || err instanceof NotFoundError) {
          return sendError(reply, err.message)
        }
        throw err
      }
    },
  )
}

export const uploFastify = fp(fastifyPlugin)
