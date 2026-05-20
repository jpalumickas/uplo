import { describe, it, expect } from 'vitest'

import { blobBufferInput } from '../src/blobInputs/blobBufferInput.js'

describe('blobBufferInput', () => {
  it('returns a BlobInput with size, content and md5 checksum', async () => {
    const buffer = Buffer.from('hello world')

    const result = await blobBufferInput({
      fileName: 'hello.txt',
      contentType: 'text/plain',
      buffer,
    })

    expect(result).toEqual({
      fileName: 'hello.txt',
      contentType: 'text/plain',
      size: buffer.length,
      content: buffer,
      checksum: 'XrY7u+Ae7tCTyyK7j1rNww==',
    })
  })
})
