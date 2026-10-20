import { describe, it, expect, vi } from 'vitest'

import { createPrismaAdapter } from '../src'

type DeleteFn = (args: unknown) => Promise<unknown>

const createAdapter = (deleteFn: DeleteFn) => {
  const prisma = { fileAttachment: { delete: vi.fn<DeleteFn>(deleteFn) } }
  return { adapter: createPrismaAdapter({ prisma: prisma as any }), prisma }
}

const options = { id: 'a1', recordId: 'r1', recordType: 'Post', name: 'images' }

describe('deleteAttachment', () => {
  it('deletes only when id, record and name match', async () => {
    const { adapter, prisma } = createAdapter(async () => ({ id: 'a1' }))

    await expect(adapter.deleteAttachment(options)).resolves.toEqual({ id: 'a1' })
    expect(prisma.fileAttachment.delete).toHaveBeenCalledWith({ where: options })
  })

  it('returns null when nothing matched', async () => {
    const { adapter } = createAdapter(async () => {
      throw Object.assign(new Error('Record not found'), { code: 'P2025' })
    })

    await expect(adapter.deleteAttachment(options)).resolves.toBeNull()
  })

  it('rethrows other errors', async () => {
    const { adapter } = createAdapter(async () => {
      throw new Error('Connection lost')
    })

    await expect(adapter.deleteAttachment(options)).rejects.toThrow('Connection lost')
  })
})
