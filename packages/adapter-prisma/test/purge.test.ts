import { describe, it, expect, vi } from 'vitest'

import { createPrismaAdapter } from '../src'

type Fn = (args: any) => Promise<any>

const createAdapter = ({
  blob = {},
  attachment = {},
}: {
  blob?: Partial<Record<'findMany' | 'findUnique' | 'deleteMany', Fn>>
  attachment?: Partial<Record<'findMany' | 'deleteMany', Fn>>
}) => {
  const prisma = {
    fileBlob: {
      findMany: vi.fn<Fn>(blob.findMany ?? (async () => [])),
      findUnique: vi.fn<Fn>(blob.findUnique ?? (async () => null)),
      deleteMany: vi.fn<Fn>(blob.deleteMany ?? (async () => ({ count: 0 }))),
    },
    fileAttachment: {
      findMany: vi.fn<Fn>(attachment.findMany ?? (async () => [])),
      deleteMany: vi.fn<Fn>(attachment.deleteMany ?? (async () => ({ count: 0 }))),
    },
  }
  return { adapter: createPrismaAdapter({ prisma: prisma as any }), prisma }
}

describe('deleteAttachments', () => {
  it('returns the deleted attachments', async () => {
    const rows = [
      { id: 'a1', blobId: 'b1' },
      { id: 'a2', blobId: 'b2' },
    ]
    const { adapter, prisma } = createAdapter({
      attachment: { findMany: async () => rows, deleteMany: async () => ({ count: 2 }) },
    })
    const where = { recordId: 'r1', recordType: 'Post', name: 'images' }

    await expect(adapter.deleteAttachments(where)).resolves.toEqual(rows)
    expect(prisma.fileAttachment.deleteMany).toHaveBeenCalledWith({
      where: { ...where, id: { in: ['a1', 'a2'] } },
    })
  })

  it('does not delete when nothing matched', async () => {
    const { adapter, prisma } = createAdapter({})

    await expect(
      adapter.deleteAttachments({ recordId: 'r1', recordType: 'Post', name: 'images' }),
    ).resolves.toEqual([])
    expect(prisma.fileAttachment.deleteMany).not.toHaveBeenCalled()
  })
})

describe('findUnattachedBlobs', () => {
  it('finds old blobs without attachments ordered by id', async () => {
    const { adapter, prisma } = createAdapter({})
    const olderThan = new Date('2026-10-20T00:00:00Z')

    await adapter.findUnattachedBlobs!({ olderThan, limit: 50, afterId: 'b9' })
    expect(prisma.fileBlob.findMany).toHaveBeenCalledWith({
      where: { createdAt: { lt: olderThan }, attachments: { none: {} }, id: { gt: 'b9' } },
      orderBy: { id: 'asc' },
      take: 50,
    })
  })
})

describe('deleteUnattachedBlob', () => {
  it('deletes only when nothing is attached and returns the blob', async () => {
    const blob = { id: 'b1', key: 'files/b1' }
    const { adapter, prisma } = createAdapter({
      blob: { findUnique: async () => blob, deleteMany: async () => ({ count: 1 }) },
    })

    await expect(adapter.deleteUnattachedBlob!('b1')).resolves.toEqual(blob)
    expect(prisma.fileBlob.deleteMany).toHaveBeenCalledWith({
      where: { id: 'b1', attachments: { none: {} } },
    })
  })

  it('returns null when the blob is attached', async () => {
    const { adapter } = createAdapter({
      blob: { findUnique: async () => ({ id: 'b1' }), deleteMany: async () => ({ count: 0 }) },
    })

    await expect(adapter.deleteUnattachedBlob!('b1')).resolves.toBeNull()
  })

  it('returns null when the blob does not exist', async () => {
    const { adapter, prisma } = createAdapter({})

    await expect(adapter.deleteUnattachedBlob!('b1')).resolves.toBeNull()
    expect(prisma.fileBlob.deleteMany).not.toHaveBeenCalled()
  })
})
