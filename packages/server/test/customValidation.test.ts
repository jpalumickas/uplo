import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { Adapter, BlobData, Service } from '@uplo/types'

import { BlobValidationError, blobStringInput, createUplo } from '../src'
import { createUploRouteHandler } from '../src/route-handler'
import type { AttachmentValidateCustom } from '../src/types'

const custom = vi.fn<AttachmentValidateCustom>()
const storagePath = vi.fn<(params: { key: string }) => string>(({ key }) => key)
const upload = vi.fn<() => Promise<void>>(async () => undefined)

const service = {
  isPublic: false,
  directUploadUrl: async (blob: BlobData) => `https://storage.test/${blob.key}`,
  directUploadHeaders: async () => ({}),
  upload,
} as unknown as Service

const createBlob = vi.fn<Adapter['createBlob']>(
  async ({ params }) => ({ id: 1, ...params }) as BlobData,
)

const uplo = createUplo({
  services: { test: service },
  adapter: {
    createBlob,
    attachBlob: async ({ blob, attachmentName, recordId, recordType }) => ({
      id: 1,
      name: attachmentName,
      blobId: blob.id,
      recordId,
      recordType,
      createdAt: new Date(),
      blob,
    }),
  } as Partial<Adapter> as Adapter,
  config: { privateKey: 'test-private-key-that-is-32-bytes' },
  attachments: {
    user: {
      avatar: {
        storagePath,
        validate: { contentType: /^image\//, custom },
      },
    },
  },
})

const handler = createUploRouteHandler({ uplo })

const createDirectUpload = (body: Record<string, unknown> = {}) =>
  handler(
    new Request('http://localhost/uplo/create-direct-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachmentName: 'user.avatar',
        fileName: 'photo.png',
        contentType: 'image/png',
        checksum: 'abc',
        size: 100,
        ...body,
      }),
    }),
  )

beforeEach(() => {
  vi.clearAllMocks()
  custom.mockResolvedValue(undefined)
})

const input = () =>
  blobStringInput({ fileName: 'photo.png', contentType: 'image/png', content: 'hello' })

describe('validate.custom on direct upload', () => {
  it('receives file, client metadata and attachment names', async () => {
    const response = await createDirectUpload({ metadata: { caption: 'Hi' } })

    expect(response.status).toEqual(201)
    expect(custom).toHaveBeenCalledWith({
      fileName: 'photo.png',
      contentType: 'image/png',
      size: 100,
      checksum: 'abc',
      metadata: { caption: 'Hi' },
      modelName: 'user',
      attachmentName: 'avatar',
    })
  })

  it('refuses with returned message as 422', async () => {
    custom.mockResolvedValue('Upload limit reached')
    const response = await createDirectUpload()

    expect(response.status).toEqual(422)
    expect(await response.json()).toEqual({
      success: false,
      error: { message: 'Upload limit reached' },
    })
    expect(createBlob).not.toHaveBeenCalled()
    expect(storagePath).not.toHaveBeenCalled()
  })

  it('supports sync functions', async () => {
    custom.mockImplementation(() => 'Not allowed')

    expect((await createDirectUpload()).status).toEqual(422)
  })

  it('does not run when built-in validation fails', async () => {
    const response = await createDirectUpload({ contentType: 'text/html' })

    expect(response.status).toEqual(422)
    expect(custom).not.toHaveBeenCalled()
  })

  it('passes thrown errors on', async () => {
    const error = new Error('Quota service is down')
    custom.mockRejectedValue(error)

    await expect(
      uplo.$findGenericAttachment('user.avatar').createDirectUpload({
        params: { fileName: 'photo.png', contentType: 'image/png', size: 100, checksum: 'abc' },
      }),
    ).rejects.toBe(error)
  })
})

describe('validate.custom on attachFile', () => {
  it('receives record ID', async () => {
    await uplo.attachments.user(42).avatar.attachFile(await input())

    expect(custom).toHaveBeenCalledWith(
      expect.objectContaining({ recordId: 42, modelName: 'user', attachmentName: 'avatar' }),
    )
  })

  it('refuses with BlobValidationError before uploading', async () => {
    custom.mockResolvedValue('Too many files')

    await expect(uplo.attachments.user(42).avatar.attachFile(await input())).rejects.toThrow(
      new BlobValidationError('Too many files'),
    )
    expect(upload).not.toHaveBeenCalled()
    expect(createBlob).not.toHaveBeenCalled()
    expect(storagePath).not.toHaveBeenCalled()
  })
})
