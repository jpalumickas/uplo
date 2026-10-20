import { describe, it, expect, vi } from 'vitest'

import { createPrismaAdapter } from '../src'
import { initFindAttachmentsLoader } from '../src/loaders/findAttachments'

const attachment = (name: string) => ({
  id: name,
  name: 'images',
  recordType: 'Post',
  recordId: 'r1',
  blobId: 'b1',
  blob: { id: 'b1' },
})

const createAdapter = () => {
  let rows = [attachment('a1')]
  const findMany = vi.fn<() => Promise<unknown[]>>(async () => rows)
  const adapter = createPrismaAdapter({ prisma: { fileAttachment: { findMany } } as any })

  return { adapter, findMany, setRows: (next: typeof rows) => (rows = next) }
}

const query = { recordId: 'r1', recordType: 'Post', name: 'images' }

describe('findAttachments loader', () => {
  it('does not cache results between calls', async () => {
    const { adapter, findMany, setRows } = createAdapter()

    expect((await adapter.findAttachments(query)).map((row) => row.id)).toEqual(['a1'])
    setRows([attachment('a1'), attachment('a2')])
    expect((await adapter.findAttachments(query)).map((row) => row.id)).toEqual(['a1', 'a2'])
    expect(findMany).toHaveBeenCalledTimes(2)
  })

  it('does not keep loaded keys', async () => {
    // A cache would keep every key; adapter passes a new key object on each call,
    // so this uses one key object to make a cache hit visible
    let rows = [attachment('a1')]
    const findMany = vi.fn<() => Promise<unknown[]>>(async () => rows)
    const loader = initFindAttachmentsLoader({ fileAttachment: { findMany } } as any)

    await loader.load(query)
    rows = [attachment('a2')]
    expect((await loader.load(query)).map((row) => row.id)).toEqual(['a2'])
    expect(findMany).toHaveBeenCalledTimes(2)
  })

  it('still batches loads in the same tick', async () => {
    const { adapter, findMany } = createAdapter()

    await Promise.all([adapter.findAttachments(query), adapter.findAttachments(query)])
    expect(findMany).toHaveBeenCalledTimes(1)
  })
})
