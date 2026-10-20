import { createHash } from 'node:crypto'
import { describe, it, expect } from 'vitest'

import { blobStringInput } from '../src/blobInputs/blobStringInput'

const input = (content: string) =>
  blobStringInput({ fileName: 'file.txt', contentType: 'text/plain', content })

describe('blobStringInput', () => {
  it.each([
    ['hello', 5],
    ['héllo', 6],
    ['こんにちは', 15],
    ['👋', 4],
  ])('size of "%s" is %i bytes', async (content, bytes) => {
    expect((await input(content)).size).toEqual(bytes)
  })

  it('checksum matches the same bytes as size', async () => {
    const content = 'héllo'

    expect((await input(content)).checksum).toEqual(
      createHash('md5').update(Buffer.from(content, 'utf8')).digest('base64'),
    )
  })
})
