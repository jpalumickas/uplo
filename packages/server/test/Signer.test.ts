import { decodeJwt } from 'jose'
import { describe, it, expect, vi, afterEach } from 'vitest'

import type { Adapter, Service } from '@uplo/types'

import { createUplo, SignerError } from '../src'
import { Signer } from '../src/Signer'

const privateKey = 'test-private-key-that-is-32-bytes'

const signer = Signer({
  privateKey,
  signedIdExpiresIn: 3600,
})

const data = { blobId: '123', modelName: 'user', attachmentName: 'avatar' }

afterEach(() => {
  vi.useRealTimers()
})

describe('Signer', () => {
  describe('generate', () => {
    it('returns generates token', async () => {
      const token = await signer.generate(data, 'blob')

      expect(token).not.toBeNull()
      const verified = await signer.verify(token, 'blob')
      expect(verified).toMatchObject(data)
    })

    it('expires token after signedIdExpiresIn seconds', async () => {
      const token = await signer.generate(data, 'blob')
      const { iat, exp } = decodeJwt(token)

      expect(exp! - iat!).toEqual(3600)
    })

    it('uses 1 hour expiry by default', async () => {
      const token = await Signer({ privateKey }).generate(data, 'blob')
      const { iat, exp } = decodeJwt(token)

      expect(exp! - iat!).toEqual(3600)
    })
  })

  describe('verify', () => {
    it('accepts token before it expires', async () => {
      vi.useFakeTimers({ now: new Date('2026-01-01T00:00:00Z') })
      const token = await signer.generate(data, 'blob')

      vi.setSystemTime(new Date('2026-01-01T00:59:00Z'))
      await expect(signer.verify(token, 'blob')).resolves.toMatchObject(data)
    })

    it('rejects expired token', async () => {
      vi.useFakeTimers({ now: new Date('2026-01-01T00:00:00Z') })
      const token = await signer.generate(data, 'blob')

      vi.setSystemTime(new Date('2026-01-01T01:00:01Z'))
      await expect(signer.verify(token, 'blob')).rejects.toThrow(/"exp" claim/)
    })
  })
})

const createWithKey = (key?: string) =>
  createUplo({
    services: { test: {} as Service },
    adapter: {} as Adapter,
    config: { privateKey: key },
    attachments: { user: { avatar: true } },
  })

describe('privateKey', () => {
  it('refuses keys shorter than 32 bytes', () => {
    expect(() => Signer({ privateKey: 'a'.repeat(31) })).toThrow(SignerError)
    expect(() => createWithKey('secret')).toThrow(/at least 32 bytes, got 6/)
  })

  it('accepts 32 byte keys', () => {
    expect(() => Signer({ privateKey: 'a'.repeat(32) })).not.toThrow()
  })

  it('counts bytes, not characters', () => {
    // 16 characters, 32 bytes in UTF-8
    expect(() => Signer({ privateKey: 'é'.repeat(16) })).not.toThrow()
    expect(() => Signer({ privateKey: 'é'.repeat(15) })).toThrow(SignerError)
  })

  it.each([undefined, ''])('allows missing key (%j) until a signed ID is needed', async (key) => {
    const uplo = createWithKey(key)

    await expect(
      uplo.signer.generate({ blobId: 1, modelName: 'user', attachmentName: 'avatar' }, 'blob'),
    ).rejects.toThrow(/Missing `privateKey`/)
  })
})
