import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { Adapter, BlobData, Service } from '@uplo/types'

import { BlobPurgeConflictError, PurgeNotSupportedError, UploError, createUplo } from '../src'
import { parseDuration } from '../src/lib/parseDuration'

const blobData = (id: string, serviceName = 'test'): BlobData => ({
  id,
  key: `files/${id}`,
  fileName: `${id}.png`,
  contentType: 'image/png',
  size: 1,
  checksum: 'x',
  metadata: {},
  serviceName,
})

type AttachmentRow = Awaited<ReturnType<Adapter['deleteAttachments']>>[number]

const row = (id: string, blobId: string) => ({ id, blobId }) as AttachmentRow

const createTestUplo = () => {
  const blobs = new Map<string, BlobData>()
  const attached = new Set<string>()
  const calls: string[] = []

  const service = {
    delete: vi.fn<Service['delete']>(async ({ key }) => {
      calls.push(`file:${key}`)
      return true
    }),
  }

  const adapter = {
    findBlob: vi.fn<Adapter['findBlob']>(async (id) => blobs.get(String(id)) ?? null),
    findBlobAttachments: vi.fn<Adapter['findBlobAttachments']>(async (id) =>
      attached.has(String(id)) ? [row('a', String(id))] : [],
    ),
    deleteUnattachedBlob: vi.fn<NonNullable<Adapter['deleteUnattachedBlob']>>(async (id) => {
      calls.push(`row:${id}`)
      const blob = blobs.get(String(id))
      if (!blob || attached.has(String(id))) {
        return null
      }
      blobs.delete(String(id))
      return blob
    }),
    findUnattachedBlobs: vi.fn<NonNullable<Adapter['findUnattachedBlobs']>>(
      async ({ limit, afterId }) =>
        // Tests add blobs in ID order, and a Map keeps insertion order
        [...blobs.values()]
          .filter((blob) => !attached.has(String(blob.id)))
          .filter((blob) => afterId === undefined || String(blob.id) > String(afterId))
          .slice(0, limit),
    ),
    deleteAttachment: vi.fn<Adapter['deleteAttachment']>(),
    deleteAttachments: vi.fn<Adapter['deleteAttachments']>(),
  }

  const uplo = createUplo({
    services: { test: service as Partial<Service> as Service },
    adapter: adapter as Partial<Adapter> as Adapter,
    config: { privateKey: 'test-private-key-that-is-32-bytes' },
    attachments: { user: { avatar: true }, post: { images: { multiple: true } } },
  })

  const add = (...ids: string[]) => ids.forEach((id) => blobs.set(id, blobData(id)))

  return { uplo, adapter, service, blobs, attached, calls, add }
}

describe('blob.purge', () => {
  it('deletes the file first and the row last', async () => {
    const { uplo, blobs, calls, add } = createTestUplo()
    add('b1')

    const blob = await uplo.$findBlob('b1')
    await expect(blob!.purge()).resolves.toBe(true)

    expect(calls).toEqual(['file:files/b1', 'row:b1'])
    expect(blobs.has('b1')).toBe(false)
  })

  it('does nothing when the blob is attached', async () => {
    const { uplo, service, attached, add } = createTestUplo()
    add('b1')
    attached.add('b1')

    const blob = await uplo.$findBlob('b1')
    await expect(blob!.purge()).resolves.toBe(false)
    expect(service.delete).not.toHaveBeenCalled()
  })

  it('keeps the row when the file delete fails', async () => {
    const { uplo, service, blobs, add } = createTestUplo()
    add('b1')
    service.delete.mockRejectedValueOnce(new Error('Storage down'))

    const blob = await uplo.$findBlob('b1')
    await expect(blob!.purge()).rejects.toThrow('Storage down')
    expect(blobs.has('b1')).toBe(true)
  })

  it('throws BlobPurgeConflictError when the blob was attached during purge', async () => {
    const { uplo, service, attached, add } = createTestUplo()
    add('b1')
    service.delete.mockImplementationOnce(async () => {
      attached.add('b1')
      return true
    })

    const blob = await uplo.$findBlob('b1')
    await expect(blob!.purge()).rejects.toThrow(BlobPurgeConflictError)
  })

  it('returns false when the row was already deleted', async () => {
    const { uplo, blobs, service, add } = createTestUplo()
    add('b1')
    service.delete.mockImplementationOnce(async () => {
      blobs.delete('b1')
      return true
    })

    const blob = await uplo.$findBlob('b1')
    await expect(blob!.purge()).resolves.toBe(false)
  })

  it('throws PurgeNotSupportedError without adapter support', async () => {
    const { uplo, adapter, service, add } = createTestUplo()
    add('b1')
    const blob = await uplo.$findBlob('b1')
    // @ts-expect-error testing an adapter without the method
    delete adapter.deleteUnattachedBlob

    await expect(blob!.purge()).rejects.toThrow(PurgeNotSupportedError)
    expect(service.delete).not.toHaveBeenCalled()
  })
})

describe('detach with purge', () => {
  it('purges the detached blob of a multiple attachment', async () => {
    const { uplo, adapter, blobs, add } = createTestUplo()
    add('b1')
    adapter.deleteAttachment.mockResolvedValueOnce(row('a1', 'b1'))

    await expect(uplo.attachments.post(1).images.detach('a1', { purge: true })).resolves.toBe(true)
    expect(blobs.has('b1')).toBe(false)
  })

  it('purges blobs of a single attachment', async () => {
    const { uplo, adapter, blobs, add } = createTestUplo()
    add('b1')
    adapter.deleteAttachments.mockResolvedValueOnce([row('a1', 'b1')])

    await expect(uplo.attachments.user(1).avatar.detach({ purge: true })).resolves.toBe(true)
    expect(adapter.deleteAttachments).toHaveBeenCalledWith({
      recordId: 1,
      recordType: 'User',
      name: 'avatar',
    })
    expect(blobs.has('b1')).toBe(false)
  })

  it('purges all blobs with detachMany', async () => {
    const { uplo, adapter, blobs, add } = createTestUplo()
    add('b1', 'b2')
    adapter.deleteAttachments.mockResolvedValueOnce([row('a1', 'b1'), row('a2', 'b2')])

    await uplo.attachments.post(1).images.detachMany({ purge: true })
    expect(blobs.size).toBe(0)
  })

  it('keeps files without purge', async () => {
    const { uplo, adapter, service, add } = createTestUplo()
    add('b1')
    adapter.deleteAttachment.mockResolvedValueOnce(row('a1', 'b1'))

    await uplo.attachments.post(1).images.detach('a1')
    await uplo.attachments.user(1).avatar.detach()
    expect(service.delete).not.toHaveBeenCalled()
  })

  it('does not detach when the adapter cannot purge', async () => {
    const { uplo, adapter } = createTestUplo()
    // @ts-expect-error testing an adapter without the method
    delete adapter.deleteUnattachedBlob

    await expect(uplo.attachments.post(1).images.detach('a1', { purge: true })).rejects.toThrow(
      PurgeNotSupportedError,
    )
    expect(adapter.deleteAttachment).not.toHaveBeenCalled()
  })
})

describe('purgeUnattached', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('purges unattached blobs in batches', async () => {
    const { uplo, adapter, blobs, attached, add } = createTestUplo()
    add('b1', 'b2', 'b3', 'b4', 'b5')
    attached.add('b3')

    const result = await uplo.purgeUnattached({ batchSize: 2 })

    expect(result.blobs.map((blob) => blob.id)).toEqual(['b1', 'b2', 'b4', 'b5'])
    expect(result).toMatchObject({ errors: [], hasMore: false })
    expect([...blobs.keys()]).toEqual(['b3'])
    expect(adapter.findUnattachedBlobs).toHaveBeenCalledTimes(3)
  })

  it('passes the cutoff from olderThan', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-21T12:00:00Z') })
    const { uplo, adapter } = createTestUplo()

    await uplo.purgeUnattached({ olderThan: '2d' })
    expect(adapter.findUnattachedBlobs).toHaveBeenCalledWith({
      olderThan: new Date('2026-10-19T12:00:00Z'),
      limit: 100,
      afterId: undefined,
    })
  })

  it('collects errors and continues after failed blobs', async () => {
    const { uplo, service, blobs, add } = createTestUplo()
    add('b1', 'b2', 'b3')
    service.delete.mockRejectedValueOnce(new Error('Storage down'))

    const result = await uplo.purgeUnattached({ batchSize: 1 })

    expect(result.blobs.map((blob) => blob.id)).toEqual(['b2', 'b3'])
    expect(result.errors).toEqual([{ blob: blobData('b1'), error: new Error('Storage down') }])
    expect([...blobs.keys()]).toEqual(['b1'])
  })

  it('reports blobs with an unknown service as errors', async () => {
    const { uplo, blobs } = createTestUplo()
    blobs.set('b1', blobData('b1', 'removed'))

    const result = await uplo.purgeUnattached()
    expect(result.errors[0]!.error).toBeInstanceOf(UploError)
    expect(blobs.has('b1')).toBe(true)
  })

  it('only lists blobs with dryRun', async () => {
    const { uplo, service, blobs, add } = createTestUplo()
    add('b1', 'b2', 'b3')

    const result = await uplo.purgeUnattached({ dryRun: true, batchSize: 2 })

    expect(result.blobs.map((blob) => blob.id)).toEqual(['b1', 'b2', 'b3'])
    expect(service.delete).not.toHaveBeenCalled()
    expect(blobs.size).toBe(3)
  })

  it('stops at maxDuration', async () => {
    const { uplo, add } = createTestUplo()
    add('b1', 'b2')

    const result = await uplo.purgeUnattached({ maxDuration: 0 })
    expect(result).toEqual({ blobs: [], errors: [], hasMore: true })
  })

  it('refuses olderThan shorter than signed ID expiry', async () => {
    const { uplo, adapter } = createTestUplo()

    await expect(uplo.purgeUnattached({ olderThan: '30m' })).rejects.toThrow(/signedIdExpiresIn/)
    await expect(uplo.purgeUnattached({ olderThan: new Date() })).rejects.toThrow(UploError)
    expect(adapter.findUnattachedBlobs).not.toHaveBeenCalled()
  })

  it('throws PurgeNotSupportedError without adapter support', async () => {
    const { uplo, adapter } = createTestUplo()
    // @ts-expect-error testing an adapter without the method
    delete adapter.findUnattachedBlobs

    await expect(uplo.purgeUnattached()).rejects.toThrow(PurgeNotSupportedError)
  })
})

describe('parseDuration', () => {
  it('parses seconds and unit strings', () => {
    expect(parseDuration(90)).toBe(90_000)
    expect(parseDuration('30s')).toBe(30_000)
    expect(parseDuration('15m')).toBe(900_000)
    expect(parseDuration('2h')).toBe(7_200_000)
    expect(parseDuration('1d')).toBe(86_400_000)
  })

  it('throws on invalid values', () => {
    expect(() => parseDuration('1w' as any)).toThrow(UploError)
    expect(() => parseDuration(-1)).toThrow(UploError)
  })
})
