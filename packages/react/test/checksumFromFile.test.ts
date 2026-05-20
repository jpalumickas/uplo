import { createHash } from 'node:crypto'
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'

import { checksumFromFile } from '../src/utils/checksumFromFile'

const md5Base64 = (data: Uint8Array | string) => createHash('md5').update(data).digest('base64')

const CHUNK_SIZE = 2_097_152 // matches the constant inside checksumFromFile

describe('checksumFromFile', () => {
  it('returns the MD5 base64 digest of an empty file', async () => {
    const file = new File([], 'empty.txt')
    const result = await checksumFromFile(file)
    expect(result).toBe('1B2M2Y8AsgTpgAmY7PhCfg==')
  })

  it('returns the MD5 base64 digest for short ASCII content', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const result = await checksumFromFile(file)
    expect(result).toBe('CY9rzUYh03PK3k6DJie09g==')
  })

  it('returns the MD5 base64 digest for "hello world"', async () => {
    const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' })
    const result = await checksumFromFile(file)
    expect(result).toBe('XrY7u+Ae7tCTyyK7j1rNww==')
  })

  it('hashes a file smaller than one chunk', async () => {
    const content = new Uint8Array(1024).fill(0x41) // 1 KB of 'A'
    const file = new File([content], 'small.bin')
    const result = await checksumFromFile(file)
    expect(result).toBe(md5Base64(content))
  })

  it('hashes a file at exactly the chunk boundary (single chunk)', async () => {
    const content = new Uint8Array(CHUNK_SIZE).fill(0x5a)
    const file = new File([content], 'boundary.bin')
    const result = await checksumFromFile(file)
    expect(result).toBe(md5Base64(content))
  })

  it('hashes a file just past the chunk boundary (two chunks)', async () => {
    const content = new Uint8Array(CHUNK_SIZE + 1)
    for (let i = 0; i < content.length; i++) content[i] = i & 0xff
    const file = new File([content], 'two-chunks.bin')
    const result = await checksumFromFile(file)
    expect(result).toBe(md5Base64(content))
  })

  it('hashes a file spanning several chunks (5 MB pattern)', async () => {
    const content = new Uint8Array(5 * 1024 * 1024)
    for (let i = 0; i < content.length; i++) content[i] = (i * 31) & 0xff
    const file = new File([content], 'large.bin')
    const result = await checksumFromFile(file)
    expect(result).toBe(md5Base64(content))
  })

  it('produces the same digest regardless of chunking', async () => {
    // The same logical bytes split into one File built from many slices vs one slice
    // should still hash identically.
    const part = new Uint8Array(CHUNK_SIZE - 17)
    for (let i = 0; i < part.length; i++) part[i] = (i + 7) & 0xff
    const oneBlob = new File([part, part, part], 'merged.bin')
    const combined = new Uint8Array(part.length * 3)
    combined.set(part, 0)
    combined.set(part, part.length)
    combined.set(part, part.length * 2)
    const result = await checksumFromFile(oneBlob)
    expect(result).toBe(md5Base64(combined))
  })
})
