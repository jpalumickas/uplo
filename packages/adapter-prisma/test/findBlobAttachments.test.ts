import { describe, it, expect, vi } from 'vitest'

import { createPrismaAdapter } from '../src'

describe('findBlobAttachments', () => {
  it('finds attachments by blob ID', async () => {
    const findMany = vi.fn<(args: unknown) => Promise<unknown[]>>(async () => [{ id: 'a1' }])
    const adapter = createPrismaAdapter({ prisma: { fileAttachment: { findMany } } as any })

    await expect(adapter.findBlobAttachments('b1')).resolves.toEqual([{ id: 'a1' }])
    expect(findMany).toHaveBeenCalledWith({ where: { blobId: 'b1' } })
  })
})
