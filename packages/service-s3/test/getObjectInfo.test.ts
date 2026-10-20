import { Readable } from 'node:stream'
import { describe, it, expect } from 'vitest'

import { createS3Service } from '../src'

type FakeResponse = { statusCode: number; headers?: Record<string, string> }

// Answers SDK requests without network
const createService = (response: FakeResponse) => {
  const requests: { method: string; path: string }[] = []
  const service = createS3Service({
    bucket: 'test-bucket',
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret',
    requestHandler: {
      handle: async (request: { method: string; path: string }) => {
        requests.push({ method: request.method, path: request.path })
        return {
          response: { headers: {}, ...response, body: Readable.from([]) },
        }
      },
    } as any,
  })
  return { service, requests }
}

describe('S3 getObjectInfo', () => {
  it('returns size and content type from HEAD request', async () => {
    const { service, requests } = createService({
      statusCode: 200,
      headers: { 'content-length': '1234', 'content-type': 'image/png' },
    })

    await expect(service.getObjectInfo!({ key: 'avatars/a.png' })).resolves.toEqual({
      size: 1234,
      contentType: 'image/png',
    })
    expect(requests[0]).toMatchObject({ method: 'HEAD', path: '/avatars/a.png' })
  })

  it('returns null when object does not exist', async () => {
    const { service } = createService({ statusCode: 404 })

    await expect(service.getObjectInfo!({ key: 'missing' })).resolves.toBeNull()
  })

  it('throws on other errors', async () => {
    const { service } = createService({ statusCode: 403 })

    await expect(service.getObjectInfo!({ key: 'forbidden' })).rejects.toMatchObject({
      $metadata: { httpStatusCode: 403 },
    })
  })
})
