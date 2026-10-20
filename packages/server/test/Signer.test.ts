import { describe, it, expect } from 'vitest'

import { Signer } from '../src/Signer'

const signer = Signer({
  privateKey: 'test',
  signedIdExpiresIn: 3600,
})

describe('Signer', () => {
  describe('generate', () => {
    it('returns generates token', async () => {
      const token = await signer.generate(
        { blobId: '123', modelName: 'user', attachmentName: 'avatar' },
        'blob',
      )

      expect(token).not.toBeNull()
      const verified = await signer.verify(token, 'blob')
      expect(verified).toMatchObject({
        blobId: '123',
        modelName: 'user',
        attachmentName: 'avatar',
      })
    })
  })
})
