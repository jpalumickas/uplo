import fastify from 'fastify'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { Adapter, BlobData, Service } from '@uplo/node'
import { createUplo } from '@uplo/node'

import { uploFastify } from '../src'

const service = {
  isPublic: false,
  directUploadUrl: async (blob: BlobData) => `https://storage.test/${blob.key}`,
  directUploadHeaders: async () => ({}),
} as unknown as Service

const createBlob = vi.fn<Adapter['createBlob']>(
  async ({ params }) => ({ id: 1, ...params }) as BlobData,
)

const uplo = createUplo({
  services: { test: service },
  adapter: { createBlob } as Partial<Adapter> as Adapter,
  config: { privateKey: 'test' },
  attachments: {
    user: {
      avatar: { validate: { contentType: 'image/png' } },
      document: { directUpload: false },
    },
  },
})

const app = fastify()
app.register(uploFastify, { uplo })

const body = {
  attachmentName: 'user.avatar',
  fileName: 'file.png',
  contentType: 'image/png',
  checksum: 'abc',
  size: 100,
}

const createDirectUpload = (payload: Record<string, unknown>) =>
  app.inject({ method: 'POST', url: '/uploads/create-direct-upload', payload })

beforeEach(() => {
  createBlob.mockClear()
})

describe('create direct upload', () => {
  it('returns 201 with signed ID and upload data', async () => {
    const response = await createDirectUpload(body)

    expect(response.statusCode).toEqual(201)
    expect(response.json()).toMatchObject({
      signedId: expect.any(String),
      upload: { url: expect.stringContaining('https://storage.test/') },
    })
  })

  it('does not pass client metadata to the blob', async () => {
    await createDirectUpload({ ...body, metadata: { analyzed: true, width: 1 } })

    expect(createBlob).toHaveBeenCalledOnce()
    expect(createBlob.mock.calls[0][0].params.metadata).toBeUndefined()
  })

  it.each(['user.avatar.validate', 'user', 'User.Avatar', 'user.avatar/x'])(
    'returns 422 for invalid attachment name "%s"',
    async (attachmentName) => {
      const response = await createDirectUpload({ ...body, attachmentName })

      expect(response.statusCode).toEqual(422)
      expect(response.json()).toMatchObject({ success: false })
      expect(createBlob).not.toHaveBeenCalled()
    },
  )

  it('returns 422 for attachment not defined in config', async () => {
    const response = await createDirectUpload({ ...body, attachmentName: 'user.constructor' })

    expect(response.statusCode).toEqual(422)
    expect(response.json()).toEqual({
      success: false,
      error: { message: 'Attachment with name user.constructor not found' },
    })
  })

  it('returns 422 for missing fields', async () => {
    const { size: _size, ...withoutSize } = body
    const response = await createDirectUpload(withoutSize)

    expect(response.statusCode).toEqual(422)
    expect(createBlob).not.toHaveBeenCalled()
  })

  it('returns 422 when attachment validation fails', async () => {
    const response = await createDirectUpload({ ...body, contentType: 'text/html' })

    expect(response.statusCode).toEqual(422)
    expect(response.json()).toEqual({ success: false, error: { message: 'Invalid content type' } })
  })

  it('returns 422 when direct upload is disabled', async () => {
    const response = await createDirectUpload({ ...body, attachmentName: 'user.document' })

    expect(response.statusCode).toEqual(422)
    expect(response.json()).toEqual({
      success: false,
      error: { message: 'Direct upload is disabled for attachment "user.document"' },
    })
  })

  it('returns 500 for other errors', async () => {
    createBlob.mockRejectedValueOnce(new Error('Database is down'))
    const response = await createDirectUpload(body)

    expect(response.statusCode).toEqual(500)
  })
})
