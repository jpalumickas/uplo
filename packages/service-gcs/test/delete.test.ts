import { File } from '@google-cloud/storage'
import { describe, it, expect, vi, afterEach } from 'vitest'

import { createGCSService } from '../src'

const service = createGCSService({ bucket: 'test-bucket', projectId: 'test-project' })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GCS delete', () => {
  it('ignores files that do not exist', async () => {
    const del = vi.spyOn(File.prototype, 'delete').mockResolvedValue([{}] as any)

    await expect(service.delete({ key: 'avatars/a.png' })).resolves.toBe(true)
    expect(del).toHaveBeenCalledWith({ ignoreNotFound: true })
  })
})
