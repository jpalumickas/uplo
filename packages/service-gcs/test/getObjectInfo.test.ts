import { File } from '@google-cloud/storage'
import { describe, it, expect, vi, afterEach } from 'vitest'

import { createGCSService } from '../src'

const service = createGCSService({ bucket: 'test-bucket', projectId: 'test-project' })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GCS getObjectInfo', () => {
  it('returns size and content type from file metadata', async () => {
    vi.spyOn(File.prototype, 'getMetadata').mockResolvedValue([
      { size: '1234', contentType: 'image/png' },
    ] as any)

    await expect(service.getObjectInfo!({ key: 'avatars/a.png' })).resolves.toEqual({
      size: 1234,
      contentType: 'image/png',
    })
  })

  it('returns null when file does not exist', async () => {
    vi.spyOn(File.prototype, 'getMetadata').mockRejectedValue(
      Object.assign(new Error('No such object'), { code: 404 }),
    )

    await expect(service.getObjectInfo!({ key: 'missing' })).resolves.toBeNull()
  })

  it('throws on other errors', async () => {
    vi.spyOn(File.prototype, 'getMetadata').mockRejectedValue(
      Object.assign(new Error('Forbidden'), { code: 403 }),
    )

    await expect(service.getObjectInfo!({ key: 'forbidden' })).rejects.toThrow('Forbidden')
  })
})
