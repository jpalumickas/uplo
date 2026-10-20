import { decodeJwt } from 'jose'
import { describe, it, expect, vi, afterEach } from 'vitest'

import { Signer } from '../src/Signer'

const signer = Signer({
  privateKey: 'test',
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
      const token = await Signer({ privateKey: 'test' }).generate(data, 'blob')
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
