import { describe, it, expect } from 'vitest'

import type { BlobData } from '@uplo/types'

import { createR2Service } from '../src'

const createService = (options: Partial<Parameters<typeof createR2Service>[0]> = {}) =>
  createR2Service({
    accountId: 'test-account',
    bucket: 'test-bucket',
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret',
    ...options,
  })

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

describe('R2 service', () => {
  describe('direct upload', () => {
    it('signs URL against account endpoint with auto region', async () => {
      const url = new URL(await createService().directUploadUrl(blob))

      expect(url.host).toBe('test-bucket.test-account.r2.cloudflarestorage.com')
      expect(url.searchParams.get('X-Amz-Credential')).toContain('/auto/s3/')
    })

    it('uses jurisdiction endpoint', async () => {
      const url = new URL(await createService({ jurisdiction: 'eu' }).directUploadUrl(blob))

      expect(url.host).toBe('test-bucket.test-account.eu.r2.cloudflarestorage.com')
    })

    it('does not send ACL', async () => {
      const service = createService({ isPublic: true, publicUrl: 'https://cdn.example.com' })
      const url = new URL(await service.directUploadUrl(blob))

      expect(url.searchParams.has('x-amz-acl')).toBe(false)
      expect(url.searchParams.get('X-Amz-SignedHeaders')).not.toContain('x-amz-acl')
      expect(await service.directUploadHeaders!(blob)).not.toHaveProperty('x-amz-acl')
    })

    it('does not sign SDK default checksum into URL', async () => {
      const url = new URL(await createService().directUploadUrl(blob))

      expect(url.searchParams.has('x-amz-checksum-crc32')).toBe(false)
      expect(url.searchParams.has('x-amz-sdk-checksum-algorithm')).toBe(false)
    })

    it('returns content type and MD5 headers', async () => {
      expect(await createService().directUploadHeaders!(blob)).toEqual({
        'Content-Type': 'image/png',
        'Content-MD5': blob.checksum,
      })
    })
  })

  describe('public URL', () => {
    it('uses public bucket URL', async () => {
      const service = createService({ isPublic: true, publicUrl: 'https://pub-123.r2.dev/' })

      expect(await service.publicUrl(blob)).toBe('https://pub-123.r2.dev/avatars/file.png')
    })

    it('requires publicUrl when public', () => {
      expect(() => createService({ isPublic: true })).toThrow(/publicUrl/)
    })
  })

  it('signs private URL', async () => {
    const url = new URL(await createService().privateUrl(blob))

    expect(url.host).toBe('test-bucket.test-account.r2.cloudflarestorage.com')
    expect(url.searchParams.has('X-Amz-Signature')).toBe(true)
  })

  it('returns r2 protocol URL', async () => {
    expect(await createService().protocolUrl(blob)).toBe('r2://test-bucket/avatars/file.png')
  })
})
