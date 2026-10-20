import { generateKeyPairSync } from 'node:crypto'
import { describe, it, expect } from 'vitest'

import type { BlobData } from '@uplo/types'

import { createGCSService } from '../src'

// Throwaway key, so URLs are signed locally without network
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })

const createService = (options: { enforceContentLength?: boolean } = {}) =>
  createGCSService({
    bucket: 'test-bucket',
    projectId: 'test-project',
    credentials: {
      client_email: 'test@test-project.iam.gserviceaccount.com',
      private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    },
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
  serviceName: 'gcs',
} as BlobData

const signedHeaders = async (service: ReturnType<typeof createService>) => {
  const url = new URL(await service.directUploadUrl(blob))
  return url.searchParams.get('X-Goog-SignedHeaders')?.split(';')
}

describe('GCS direct upload', () => {
  describe('by default', () => {
    const service = createService()

    it('does not sign content length range into upload URL', async () => {
      expect(await signedHeaders(service)).not.toContain('x-goog-content-length-range')
    })

    it('does not return content length range header', async () => {
      const headers = await service.directUploadHeaders!(blob)

      expect(headers).not.toHaveProperty('x-goog-content-length-range')
    })
  })

  describe('with enforceContentLength', () => {
    const service = createService({ enforceContentLength: true })

    it('signs content length range into upload URL', async () => {
      expect(await signedHeaders(service)).toContain('x-goog-content-length-range')
    })

    it('returns content length range header with declared size', async () => {
      const headers = await service.directUploadHeaders!(blob)

      expect(headers).toMatchObject({ 'x-goog-content-length-range': '1234,1234' })
    })
  })
})
