import { describe, it, expect, vi } from 'vitest'

import type { Adapter, BlobData, Service } from '@uplo/types'

import { createUplo } from '../src'
import { createUploRouteHandler } from '../src/route-handler'

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
  adapter: { createBlob } as unknown as Adapter,
  config: { privateKey: 'test' },
  attachments: {
    user: {
      avatar: true,
      document: { directUpload: false },
    },
  },
})

const handler = createUploRouteHandler({ uplo })

const createDirectUpload = (attachmentName: string) =>
  handler(
    new Request('http://localhost/uplo/create-direct-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachmentName,
        fileName: 'file.pdf',
        contentType: 'application/pdf',
        checksum: 'abc',
        size: 100,
      }),
    }),
  )

describe('create direct upload', () => {
  it('creates direct upload by default', async () => {
    createBlob.mockClear()
    const response = await createDirectUpload('user.avatar')

    expect(response.status).toEqual(201)
    expect(createBlob).toHaveBeenCalledOnce()
  })

  it('refuses direct upload when directUpload is false', async () => {
    createBlob.mockClear()
    const response = await createDirectUpload('user.document')

    expect(response.status).toEqual(422)
    expect(await response.json()).toEqual({
      success: false,
      error: { message: 'Direct upload is disabled for attachment "user.document"' },
    })
    expect(createBlob).not.toHaveBeenCalled()
  })
})
