import { describe, it, expect } from 'vitest'

import type { BlobData } from '@uplo/types'

import { createS3Service } from '../src'

const createService = (options: Partial<Parameters<typeof createS3Service>[0]> = {}) =>
  createS3Service({
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
  serviceName: 's3',
} as BlobData

const urlFor = async (key: string, options = {}) =>
  new URL(await createService(options).publicUrl({ ...blob, key })).href

describe('S3 service options', () => {
  describe('acl', () => {
    it('sends public-read ACL by default for public service', async () => {
      const service = createService({ isPublic: true })
      const url = new URL(await service.directUploadUrl(blob))

      expect(url.searchParams.get('x-amz-acl')).toBe('public-read')
      expect(await service.directUploadHeaders!(blob)).toHaveProperty('x-amz-acl', 'public-read')
    })

    it('does not send ACL when disabled', async () => {
      const service = createService({ isPublic: true, acl: false })
      const url = new URL(await service.directUploadUrl(blob))

      expect(url.searchParams.has('x-amz-acl')).toBe(false)
      expect(await service.directUploadHeaders!(blob)).not.toHaveProperty('x-amz-acl')
    })
  })

  describe('publicUrl', () => {
    it('uses public base URL when given', async () => {
      const service = createService({
        endpoint: 'https://minio.example.com',
        publicUrl: 'https://cdn.example.com/',
      })

      expect(await service.publicUrl(blob)).toBe('https://cdn.example.com/avatars/file.png')
    })

    it('falls back to endpoint URL', async () => {
      const service = createService({ endpoint: 'https://minio.example.com' })

      expect(await service.publicUrl(blob)).toBe(
        'https://minio.example.com/test-bucket/avatars/file.png',
      )
    })

    it('falls back to AWS URL', async () => {
      expect(await createService().publicUrl(blob)).toBe(
        'https://test-bucket.s3.amazonaws.com/avatars/file.png',
      )
    })
  })

  describe('publicUrl key encoding', () => {
    it('keeps plain keys unchanged', async () => {
      expect(await urlFor('avatars/abc123.png')).toBe(
        'https://test-bucket.s3.amazonaws.com/avatars/abc123.png',
      )
    })

    it.each([
      {},
      { endpoint: 'https://minio.example.com' },
      { publicUrl: 'https://cdn.example.com' },
    ])('encodes ? # and spaces so the URL points to the same key (%j)', async (options) => {
      const url = new URL(await urlFor('avatars/a b?x=1#y.png', options))

      expect(url.search).toBe('')
      expect(url.hash).toBe('')
      expect(decodeURIComponent(url.pathname)).toMatch(/\/avatars\/a b\?x=1#y\.png$/)
    })

    it.each(['../other-bucket/evil.html', 'avatars/./file.png'])(
      'throws for key with dot segment "%s"',
      async (key) => {
        await expect(
          createService({ endpoint: 'https://minio.example.com' }).publicUrl({ ...blob, key }),
        ).rejects.toThrow(/Cannot build public URL/)
      },
    )
  })
})
