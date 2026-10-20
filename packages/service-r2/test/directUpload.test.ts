import { describe, it, expect } from 'vitest'

import type { BlobData } from '@uplo/types'

import { createR2Service } from '../src'

const blob = {
  id: 1,
  key: 'avatars/file.png',
  fileName: 'file.png',
  contentType: 'image/png',
  checksum: 'rL0Y20zC+Fzt72VPzMSk2A==',
  size: 1234,
  metadata: {},
  serviceName: 'r2',
} as BlobData

describe('R2 direct upload', () => {
  it('signs content type', async () => {
    const service = createR2Service({
      accountId: 'test-account',
      bucket: 'test-bucket',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
    })
    const url = new URL(await service.directUploadUrl(blob))

    expect(url.searchParams.get('X-Amz-SignedHeaders')?.split(';')).toContain('content-type')
  })
})
