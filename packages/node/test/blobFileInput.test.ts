import { createHash } from 'node:crypto'
import type { ReadStream } from 'node:fs'
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { text } from 'node:stream/consumers'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'

import { blobFileInput as createInput } from '../src/blobInputs/blobFileInput.js'

const content = 'hello wörld, this is the file content'
const md5 = createHash('md5').update(content).digest('base64')

// Close content stream of inputs that are not read, so it does not open the file after cleanup
const opened: ReadStream[] = []
const blobFileInput = async (options: Parameters<typeof createInput>[0]) => {
  const input = await createInput(options)
  opened.push(input.content as ReadStream)
  return input
}

let dir: string
let file: string

beforeAll(() => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'uplo-file-input-'))
  file = path.join(dir, 'file.txt')
  writeFileSync(file, content)
})

afterEach(async () => {
  await Promise.all(
    opened.splice(0).map(
      (stream) =>
        new Promise<void>((resolve) => {
          if (stream.closed) {
            resolve()
            return
          }
          stream.once('close', () => resolve())
          stream.destroy()
        }),
    ),
  )
})

afterAll(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('blobFileInput', () => {
  it('returns size, checksum and content type of the file', async () => {
    const input = await blobFileInput({ path: file })

    expect(input).toMatchObject({
      fileName: 'file.txt',
      contentType: 'text/plain',
      size: Buffer.byteLength(content),
      checksum: md5,
    })
  })

  it('returns content stream with the whole file', async () => {
    const input = await blobFileInput({ path: file })

    expect(await text(input.content as NodeJS.ReadableStream)).toEqual(content)
  })

  it('uses target file size for symlinks', async () => {
    const link = path.join(dir, 'link-with-a-long-name-to-differ-from-target.txt')
    symlinkSync(file, link)

    const input = await blobFileInput({ path: link })

    expect(input.size).toEqual(Buffer.byteLength(content))
    expect(input.checksum).toEqual(md5)
  })
})
