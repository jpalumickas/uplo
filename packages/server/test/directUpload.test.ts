import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { Adapter, AttachmentData, BlobData, Service } from '@uplo/types'

import { createUplo, DirectUploadDisabledError, InvalidSignedIdError } from '../src'
import { createUploRouteHandler } from '../src/route-handler'
import type { SignerBlobData } from '../src/Signer'

const service = {
  isPublic: false,
  directUploadUrl: async (blob: BlobData) => `https://storage.test/${blob.key}`,
  directUploadHeaders: async () => ({}),
} as unknown as Service

const blobs = new Map<BlobData['id'], BlobData>()

const createBlob = vi.fn<Adapter['createBlob']>(async ({ params }) => {
  const blob = { id: blobs.size + 1, ...params } as BlobData
  blobs.set(blob.id, blob)
  return blob
})

const adapter: Partial<Adapter> = {
  createBlob,
  findBlob: async (id) => blobs.get(id) ?? null,
  attachBlob: async ({ blob, attachmentName, recordId, recordType }) =>
    ({
      id: 1,
      name: attachmentName,
      blobId: blob.id,
      recordId,
      recordType,
      createdAt: new Date(),
      blob,
    }) as AttachmentData,
}

const uplo = createUplo({
  services: { test: service },
  adapter: adapter as Adapter,
  config: { privateKey: 'test' },
  attachments: {
    user: {
      avatar: true,
      cover: true,
      document: { directUpload: false },
    },
    post: {
      avatar: true,
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

const getSignedId = async (attachmentName: string) => {
  const response = await createDirectUpload(attachmentName)
  const data = (await response.json()) as { signedId: string }
  return data.signedId
}

beforeEach(() => {
  blobs.clear()
  createBlob.mockClear()
})

describe('create direct upload', () => {
  it('creates direct upload by default', async () => {
    const response = await createDirectUpload('user.avatar')

    expect(response.status).toEqual(201)
    expect(createBlob).toHaveBeenCalledOnce()
  })

  it('refuses direct upload when directUpload is false', async () => {
    const response = await createDirectUpload('user.document')

    expect(response.status).toEqual(422)
    expect(await response.json()).toEqual({
      success: false,
      error: { message: 'Direct upload is disabled for attachment "user.document"' },
    })
    expect(createBlob).not.toHaveBeenCalled()
  })
})

describe('attach signed file', () => {
  it('attaches signed ID created for the same attachment', async () => {
    const signedId = await getSignedId('user.avatar')
    const attachment = await uplo.attachments.user(1).avatar.attachSignedFile(signedId)

    expect(attachment.name).toEqual('avatar')
    expect(attachment.blobId).toEqual(1)
  })

  it('refuses signed ID created for another attachment', async () => {
    const signedId = await getSignedId('user.avatar')

    await expect(uplo.attachments.user(1).cover.attachSignedFile(signedId)).rejects.toThrow(
      InvalidSignedIdError,
    )
  })

  it('refuses signed ID created for another model', async () => {
    const signedId = await getSignedId('user.avatar')

    await expect(uplo.attachments.post(1).avatar.attachSignedFile(signedId)).rejects.toThrow(
      InvalidSignedIdError,
    )
  })

  it('refuses signed ID without attachment names', async () => {
    blobs.set(1, { id: 1, serviceName: 'test' } as BlobData)
    const signedId = await uplo.signer.generate({ blobId: 1 } as SignerBlobData, 'blob')

    await expect(uplo.attachments.user(1).avatar.attachSignedFile(signedId)).rejects.toThrow(
      InvalidSignedIdError,
    )
  })

  it('refuses signed ID when directUpload is false', async () => {
    const signedId = await getSignedId('user.avatar')

    await expect(uplo.attachments.user(1).document.attachSignedFile(signedId)).rejects.toThrow(
      DirectUploadDisabledError,
    )
  })
})
