import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { Adapter, AttachmentData, BlobData, Service, ServiceObjectInfo } from '@uplo/types'

import { BlobNotUploadedError, BlobValidationError, createUplo } from '../src'

let objectInfo: ServiceObjectInfo | null = null
const getObjectInfo = vi.fn<NonNullable<Service['getObjectInfo']>>(async () => objectInfo)

const baseService = {
  isPublic: false,
  directUploadUrl: async (blob: BlobData) => `https://storage.test/${blob.key}`,
  directUploadHeaders: async () => ({}),
}

const blobs = new Map<BlobData['id'], BlobData>()
const attachBlob = vi.fn<Adapter['attachBlob']>(
  async ({ blob, attachmentName, recordId, recordType }) => ({
    id: 1,
    name: attachmentName,
    blobId: blob.id,
    recordId,
    recordType,
    createdAt: new Date(),
    blob,
  }),
)

const adapter: Partial<Adapter> = {
  createBlob: async ({ params }) => {
    const blob = { id: blobs.size + 1, ...params } as BlobData
    blobs.set(blob.id, blob)
    return blob
  },
  findBlob: async (id) => blobs.get(id) ?? null,
  findBlobAttachments: async () => [] as AttachmentData[],
  attachBlob,
}

const createInstance = (service: Partial<Service>) =>
  createUplo({
    services: { test: { ...baseService, ...service } as Service },
    adapter: adapter as Adapter,
    config: { privateKey: 'test-private-key-that-is-32-bytes' },
    attachments: { user: { avatar: true } },
  })

const uplo = createInstance({ getObjectInfo })

const signedIdFor = async (instance: ReturnType<typeof createInstance>) => {
  const { signedId } = await instance.$findGenericAttachment('user.avatar').createDirectUpload({
    params: { fileName: 'photo.png', contentType: 'image/png', size: 100, checksum: 'abc' },
  })
  return signedId
}

beforeEach(() => {
  blobs.clear()
  attachBlob.mockClear()
  getObjectInfo.mockClear()
})

describe('attachSignedFile upload check', () => {
  it('attaches when stored file matches', async () => {
    objectInfo = { size: 100, contentType: 'image/png' }

    await expect(
      uplo.attachments.user(1).avatar.attachSignedFile(await signedIdFor(uplo)),
    ).resolves.toBeTruthy()
    expect(getObjectInfo).toHaveBeenCalledWith({ key: blobs.get(1)!.key })
    expect(attachBlob).toHaveBeenCalledOnce()
  })

  it('ignores content type parameters and case', async () => {
    objectInfo = { size: 100, contentType: 'Image/PNG; charset=binary' }

    await expect(
      uplo.attachments.user(1).avatar.attachSignedFile(await signedIdFor(uplo)),
    ).resolves.toBeTruthy()
  })

  it('attaches when storage returns no content type', async () => {
    objectInfo = { size: 100 }

    await expect(
      uplo.attachments.user(1).avatar.attachSignedFile(await signedIdFor(uplo)),
    ).resolves.toBeTruthy()
  })

  it('refuses when file was not uploaded', async () => {
    objectInfo = null

    await expect(
      uplo.attachments.user(1).avatar.attachSignedFile(await signedIdFor(uplo)),
    ).rejects.toThrow(BlobNotUploadedError)
    expect(attachBlob).not.toHaveBeenCalled()
  })

  it('refuses when size does not match', async () => {
    objectInfo = { size: 5_000_000, contentType: 'image/png' }

    await expect(
      uplo.attachments.user(1).avatar.attachSignedFile(await signedIdFor(uplo)),
    ).rejects.toThrow(/size 5000000 does not match declared size 100/)
    expect(attachBlob).not.toHaveBeenCalled()
  })

  it('refuses when content type does not match', async () => {
    objectInfo = { size: 100, contentType: 'text/html' }

    await expect(
      uplo.attachments.user(1).avatar.attachSignedFile(await signedIdFor(uplo)),
    ).rejects.toThrow(BlobValidationError)
    expect(attachBlob).not.toHaveBeenCalled()
  })

  it('skips the check when service has no getObjectInfo', async () => {
    const withoutInfo = createInstance({})

    await expect(
      withoutInfo.attachments.user(1).avatar.attachSignedFile(await signedIdFor(withoutInfo)),
    ).resolves.toBeTruthy()
  })
})
