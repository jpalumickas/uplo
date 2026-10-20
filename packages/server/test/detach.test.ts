import { describe, it, expect, vi } from 'vitest'

import type { Adapter, Service } from '@uplo/types'

import { AttachmentNotFoundError, createUplo } from '../src'

const deleteAttachment = vi.fn<Adapter['deleteAttachment']>()

const uplo = createUplo({
  services: { test: {} as Service },
  adapter: { deleteAttachment } as Partial<Adapter> as Adapter,
  config: { privateKey: 'test' },
  attachments: { post: { images: { multiple: true } } },
})

describe('detach', () => {
  it('deletes attachment scoped to record and attachment name', async () => {
    deleteAttachment.mockResolvedValueOnce({ id: 1 } as Awaited<
      ReturnType<Adapter['deleteAttachment']>
    >)

    await expect(uplo.attachments.post(456).images.detach(1)).resolves.toBe(true)
    expect(deleteAttachment).toHaveBeenCalledWith({
      id: 1,
      recordId: 456,
      recordType: 'Post',
      name: 'images',
    })
  })

  it('throws when attachment does not belong to record', async () => {
    deleteAttachment.mockResolvedValueOnce(null)

    await expect(uplo.attachments.post(456).images.detach(999)).rejects.toThrow(
      AttachmentNotFoundError,
    )
  })
})
