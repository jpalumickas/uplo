import { describe, it, expect } from 'vitest'

import type { BlobData } from '@uplo/types'

import { createS3Service } from '../src'

const service = createS3Service({
  bucket: 'test-bucket',
  accessKeyId: 'test-key',
  secretAccessKey: 'test-secret',
})

const blob = {
  id: 1,
  key: 'avatars/file.png',
  fileName: 'file.png',
  contentType: 'image/png',
  checksum: 'rL0Y20zC+Fzt72VPzMSk2A==',
  size: 1234,
  metadata: {},
  serviceName: 's3',
} as BlobData

const signedHeaders = async () => {
  const url = new URL(await service.directUploadUrl(blob))
  return url.searchParams.get('X-Amz-SignedHeaders')?.split(';')
}

describe('S3 direct upload', () => {
  it('signs content type, size and checksum', async () => {
    expect(await signedHeaders()).toEqual(
      expect.arrayContaining(['content-type', 'content-length', 'content-md5']),
    )
  })

  it('returns the signed content type for the client to send', async () => {
    expect(await service.directUploadHeaders!(blob)).toMatchObject({
      'Content-Type': 'image/png',
    })
  })

  it('does not sign a checksum of an empty body by default', async () => {
    const url = new URL(await service.directUploadUrl(blob))

    expect(url.searchParams.has('x-amz-checksum-crc32')).toBe(false)
    expect(url.searchParams.has('x-amz-sdk-checksum-algorithm')).toBe(false)
  })

  it('allows SDK checksum behavior to be set', async () => {
    const withChecksum = createS3Service({
      bucket: 'test-bucket',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
      requestChecksumCalculation: 'WHEN_SUPPORTED',
    })
    const url = new URL(await withChecksum.directUploadUrl(blob))

    expect(url.searchParams.has('x-amz-checksum-crc32')).toBe(true)
  })
})
